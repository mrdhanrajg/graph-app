import { GitBranch, ArrowRight } from "lucide-react";

function Recommendations({ recommendations }) {
    if (!recommendations?.length) {
        return (
            <div className="empty-state">
                No connected technologies found.
            </div>
        );
    }

    return (
        <div className="recommendation-list">
            {recommendations.map((item, index) => (
                <div
                    className="recommendation-row"
                    key={`${item.technology}-${item.relatedTechnology}-${index}`}
                >
                    <div className="path-icon">
                        <GitBranch size={17} />
                    </div>

                    <div className="recommendation-path">
                        {item.path.map((technology, index) => (
                            <span key={`${technology}-${index}`} className="path-item">
                                {technology}

                                {index < item.path.length - 1 && (
                                    <ArrowRight size={15} />
                                )}
                            </span>
                        ))}
                    </div>

                    <span className="recommendation-project">
                        {item.project}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default Recommendations;