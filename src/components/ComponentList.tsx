type Component = {
  name: string;
  path: string;
};

type ComponentListProps = {
  components: Component[];
};

const DOCS_BASE_URL = 'https://ai-elements.vercel.app/components/';

export function ComponentList({ components }: ComponentListProps) {
  return (
    <ul className="component-list" role="list">
      {components.map((component) => (
        <li key={component.path} className="component-item" role="listitem">
          <div>
            <span className="component-name">{component.name}</span>
            <span className="component-path">{component.path}</span>
          </div>
          <a href={`${DOCS_BASE_URL}${component.path}`} aria-label={`View ${component.name} component`}>
            View docs
          </a>
        </li>
      ))}
    </ul>
  );
}
