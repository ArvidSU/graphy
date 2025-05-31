import { Section } from "../core/Section";
import { Button } from "../core/Button";

export function RulesToolbar() {
  return (
    <div className="space-y-4">
      <Section title="Validation Rules" bordered>
        <p className="text-sm text-gray-600 mb-3">
          Define rules to validate your graph structure and data consistency.
        </p>
        <div className="space-y-2">
          <Button className="w-full text-left">
            + Add Node Validation Rule
          </Button>
          <Button className="w-full text-left">
            + Add Edge Validation Rule
          </Button>
          <Button className="w-full text-left">
            + Add Data Consistency Rule
          </Button>
        </div>
      </Section>

      <Section title="Execution Rules" bordered>
        <p className="text-sm text-gray-600 mb-3">
          Define rules for automatic actions and transformations.
        </p>
        <div className="space-y-2">
          <Button className="w-full text-left">
            + Add Auto-Connect Rule
          </Button>
          <Button className="w-full text-left">
            + Add Transform Rule
          </Button>
        </div>
      </Section>

      <Section title="Active Rules" bordered>
        <p className="text-sm text-gray-500 italic">
          No rules defined yet
        </p>
      </Section>
    </div>
  );
}
