import type { ReactNode } from "react";

export type PropertyItem = {
  title: string;
  body: ReactNode;
};

export function PropertyList({ items }: { items: PropertyItem[] }) {
  return (
    <ul className="property-list">
      {items.map((item) => (
        <li key={item.title}>
          <span className="property-tag" aria-hidden="true">
            §
          </span>
          <span className="property-text">
            <strong>{item.title}</strong> {item.body}
          </span>
        </li>
      ))}
    </ul>
  );
}
