import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NodeType } from '@prisma/client';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService
  ) {}

  async findAll() {
    const workflows = await this.prisma.workflow.findMany({
        include: { nodes: true }
    });

    return workflows.map(wf => {
        let edges = wf.edgesJson;
        if (typeof edges === 'string') {
            try { edges = JSON.parse(edges); } catch (e) { edges = []; }
        }
        return {
            ...wf,
            edges: (edges as any[]) || [],
            nodes: wf.nodes.map(node => ({
                ...node,
                config: node.configJson,
                position: { x: node.positionX, y: node.positionY }
            }))
        };
    });
  }

  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({ 
        where: { id },
        include: { nodes: true }
    });
    
    if (!workflow) return null;

    let edges = workflow.edgesJson;
    if (typeof edges === 'string') {
        try { edges = JSON.parse(edges); } catch (e) { edges = []; }
    }

    // Map back to IWorkflowDefinition structure
    return {
        ...workflow,
        edges: (edges as any[]) || [],
        nodes: workflow.nodes.map(node => ({
            ...node,
            config: node.configJson,
            position: { x: node.positionX, y: node.positionY }
        }))
    };
  }

  async create(data: CreateWorkflowDto, userId: string) {
    const { nodes, edges, ...workflowData } = data;

    // Map nodes to Prisma format
    const prismaNodes = nodes.map(node => {
        let type: NodeType = NodeType.TRIGGER_WEBHOOK; // Default
        
        // Heuristic mapping
        const upperType = node.type.toUpperCase();
        if (upperType.includes('TRIGGER')) type = NodeType.TRIGGER_WEBHOOK;
        else if (upperType.includes('ACTION')) type = NodeType.ACTION_HTTP;
        else if (upperType.includes('LOGIC')) type = NodeType.LOGIC_IF;
        
        // Exact match check
        if (Object.values(NodeType).includes(node.type as NodeType)) {
            type = node.type as NodeType;
        }

        return {
            name: node.name,
            type: type,
            positionX: Math.round(node.position.x),
            positionY: Math.round(node.position.y),
            configJson: node.config || {},
        };
    });

    return this.prisma.workflow.create({
      data: {
        name: workflowData.name,
        description: workflowData.description,
        isActive: workflowData.isActive,
        edgesJson: (edges as any) ?? [],
        owner: {
            connect: { id: userId }
        },
        nodes: {
            create: prismaNodes
        }
      },
      include: { nodes: true }
    });
  }

  async update(id: string, data: UpdateWorkflowDto) {
    const { nodes, edges, projectId, ...workflowData } = data;
    
    // Use a transaction to ensure atomicity of node replacement
    return this.prisma.$transaction(async (tx) => {
        const updateData: any = {
            ...workflowData,
        };

        if (edges !== undefined) {
            updateData.edgesJson = (edges as any) ?? [];
        }

        if (nodes) {
            // Delete existing nodes
            await tx.node.deleteMany({ where: { workflowId: id } });
            
            const prismaNodes = nodes.map(node => {
                let type: NodeType = NodeType.TRIGGER_WEBHOOK;
                const upperType = node.type.toUpperCase();
                if (upperType.includes('TRIGGER')) type = NodeType.TRIGGER_WEBHOOK;
                else if (upperType.includes('ACTION')) type = NodeType.ACTION_HTTP;
                else if (upperType.includes('LOGIC')) type = NodeType.LOGIC_IF;
                
                if (Object.values(NodeType).includes(node.type as NodeType)) {
                    type = node.type as NodeType;
                }
        
                return {
                    id: node.id, // Preserve the ID
                    name: node.name,
                    type: type,
                    positionX: Math.round(node.position.x),
                    positionY: Math.round(node.position.y),
                    configJson: node.config || {},
                };
            });

            updateData.nodes = {
                create: prismaNodes
            };
        }

        return tx.workflow.update({ 
            where: { id }, 
            data: updateData,
            include: { nodes: true }
        });
    });
  }

  async delete(id: string) {
    return this.prisma.workflow.delete({ where: { id } });
  }
}
