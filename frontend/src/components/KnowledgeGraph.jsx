import { useEffect, useMemo, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const API_BASE_URL = "http://localhost:8080/api";

function KnowledgeGraph({ developerName }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [graph, setGraph] = useState({
        nodes: [],
        edges: [],
    });

    useEffect(() => {
        fetch(
            `${API_BASE_URL}/developers/${encodeURIComponent(
                developerName
            )}/graph/relationships`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load graph");
                }

                return response.json();
            })
            .then((graph) => {
                const flowNodes = graph.nodes.map((node, index) => ({
                    id: node.id,
                    position: {
                        x: (index % 4) * 230,
                        y: Math.floor(index / 4) * 140,
                    },
                    data: {
                        label: (
                            <div>
                                <strong>{node.name}</strong>
                                <div style={{ fontSize: 11, opacity: 0.65 }}>
                                    {node.label}
                                </div>
                            </div>
                        ),
                    },
                    style: {
                        borderRadius: 12,
                        padding: 12,
                        border: "1px solid #dfe3ea",
                        background: "#ffffff",
                        minWidth: 150,
                    },
                }));

                const flowEdges = graph.edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.type,
                }));

                setGraph({
                    nodes: flowNodes,
                    edges: flowEdges,
                });
            })
            .catch(setError);
    }, [developerName]);

    const { nodes, edges } = useMemo(() => {
        const nodeMap = new Map();
        const edgeMap = new Map();

        data.forEach((path) => {
            (path.nodes || []).forEach((node) => {
                if (!nodeMap.has(node.id)) {
                    nodeMap.set(node.id, node);
                }
            });

            (path.relationships || []).forEach((relationship) => {
                if (!edgeMap.has(relationship.id)) {
                    edgeMap.set(relationship.id, relationship);
                }
            });
        });

        const nodeArray = [...nodeMap.values()];
        const edgeArray = [...edgeMap.values()];

        const flowNodes = nodeArray.map((node, index) => ({
            id: node.id,
            position: getPosition(node),
            data: {
                label: (
                    <div>
                        <strong>{node.name}</strong>
                        <div style={{ fontSize: 11, opacity: 0.65 }}>
                            {node.label}
                        </div>
                    </div>
                ),
            },
            style: {
                borderRadius: 12,
                padding: 12,
                border: "1px solid #dfe3ea",
                background: "#ffffff",
                minWidth: 150,
            },
        }));

        const flowEdges = edgeArray.map((relationship) => ({
            id: relationship.id,
            source: relationship.source,
            target: relationship.target,
            label: relationship.type,
            animated: false,
        }));

        return {
            nodes: flowNodes,
            edges: flowEdges,
        };
    }, [data]);

    const getPosition = (node) => {
        if (node.label === "Developer") {
            return { x: 80, y: 260 };
        }

        if (node.label === "Project") {
            return { x: 360, y: 260 };
        }

        const technologyPositions = {
            Java: { x: 650, y: 120 },
            React: { x: 650, y: 260 },
            Kafka: { x: 650, y: 400 },
            "Spring Boot": { x: 930, y: 120 },
            Microservices: { x: 1210, y: 220 },
        };

        return technologyPositions[node.name] ?? {
            x: 650,
            y: 500,
        };
    };

    if (error) {
        return <p>Unable to load relationship graph.</p>;
    }

    return (
        <div style={{ width: "100%", height: 620 }}>
            <ReactFlow
                nodes={graph.nodes}
                edges={graph.edges}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}

export default KnowledgeGraph;