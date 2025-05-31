import { Toggle } from "@core/Toggle"
import { Section } from "@core/Section"
import { ToolButton } from "@core/Button";

export function Controls( props: { title?: string } ) {
  const { title } = props;
  return (
    <Section
      title={ title || "Controls" }
      collapsible
      bordered
      padding={ 2 }
      margin={ 2 }
      className="flex flex-col shrink-0"
    >
      <Toggle
        label="Infer edges"
        state={ false }
        onChange={ ( newState ) => {
          console.log( "Infer edges toggled:", newState );
        } }
      >
        <ToolButton />
      </Toggle>
      <Toggle
        label="Link layers"
        state={ false }
        onChange={ ( newState ) => {
          console.log( "Link layers toggled:", newState );
        } }
      />
    </Section>
  )
}

