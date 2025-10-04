import type { ReactNode } from 'react';

type IndexCard = {
  title: string;
  description: string;
  href: string;
  actionLabel?: ReactNode;
};

type IndexCardsProps = {
  cards: IndexCard[];
};

export function IndexCards({ cards }: IndexCardsProps) {
  return (
    <div className="grid" role="list">
      {cards.map((card) => (
        <article key={card.href} className="card" role="listitem">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <a href={card.href} aria-label={`Read more about ${card.title}`}>
            {card.actionLabel ?? 'Read the guide'}
          </a>
        </article>
      ))}
    </div>
  );
}
