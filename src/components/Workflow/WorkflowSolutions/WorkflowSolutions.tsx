import './styles.css';

interface WorkflowSolutionsProps {
  solutions: ExtendedFeatureCollection[];
  setSelectedSolution: (solutionIndex: number) => void;
}

function WorkflowSolutions(props: WorkflowSolutionsProps) {
  return (
    <div className="workflow_solutions flex flex_col">
      <h3>Solutions</h3>
      {props.solutions.map((solution: ExtendedFeatureCollection, index: number) => {
        return (
          <div
            key={`workflow_solution_${index}`}
            className="workflow_solution"
            onClick={() => props.setSelectedSolution(index)}
          >
            {`Solution ${index + 1}`}
          </div>
        )
      })}
    </div>
  )
}

export { WorkflowSolutions };