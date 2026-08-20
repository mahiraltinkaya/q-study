export interface ConditionListProps {
  conditions: readonly string[];
}

function ConditionList({ conditions }: ConditionListProps) {
  return (
    <ul className="columns-1 gap-x-10 text-left sm:columns-2">
      {conditions.map((condition) => (
        <li
          key={condition}
          className="flex break-inside-avoid items-start gap-3 py-2.5 text-sm text-zinc-700"
        >
          <span aria-hidden className="bg-brand mt-1.5 size-2 shrink-0 rotate-45" />
          {condition}
        </li>
      ))}
    </ul>
  );
}

export { ConditionList };
