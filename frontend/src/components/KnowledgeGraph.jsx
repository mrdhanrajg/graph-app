import { useEffect, useState } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { getRelationshipGraph } from "../services/api";

function KnowledgeGraph({ developerName }) {
    const [graph, setGraph] = useState({
        nodes: [],
        edges: [],
    });

    const [error, setError] = useState(null);

    useEffect(() => {
        setError(null);

        getRelationshipGraph(developerName)
            .then((graphData) => {
                const flowNodes = graphData.nodes.map((node) => ({
                    id: node.id,
                    position: getPosition(node),
                    data: {
                        label: (
                            <div>
                                <strong>{node.name}</strong>

                                <div
                                    style={{
                                        fontSize: 11,
                                        opacity: 0.65,
                                    }}
                                >
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

                const flowEdges = graphData.edges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    label: edge.type,
                    animated: false,
                }));

                setGraph({
                    nodes: flowNodes,
                    edges: flowEdges,
                });
            })
            .catch((err) => {
                console.error(
                    "Failed to load relationship graph:",
                    err
                );

                setGraph({
                    nodes: [],
                    edges: [],
                });

                setError(err);
            });
    }, [developerName]);

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

function getPosition(node) {
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

    return (
        technologyPositions[node.name] ?? {
            x: 650,
            y: 500,
        }
    );
}

export default KnowledgeGraph;