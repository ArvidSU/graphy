# Rule System User Guide

This guide explains how to use the newly implemented rule system in the Function Toolbar to create mathematical expressions and data transformations between nodes.

## Getting Started

### 1. Create Function Nodes

The project now includes pre-configured function node templates to get you started:

- **Calculator** (green) - Basic arithmetic operations with `a` and `b` parameters
- **Data Processor** (blue) - Data processing with `input` and `multiplier` parameters
- **Aggregator** (orange) - Aggregation operations with `values` and `items` parameters

To create nodes:

1. Go to the **Node Types** tab
2. Select one of the function node templates as default
3. Click anywhere on the canvas to create nodes of that type

### 2. Create Supporting Data Nodes

Create some key-value nodes to provide input data:

1. Set the default node type to "Node" (key-value)
2. Create nodes with data like:
   - Node labeled "Input A" with key "value" = "10"
   - Node labeled "Input B" with key "value" = "5"
   - Node labeled "Config" with key "multiplier" = "2"

### 3. Access the Function Toolbar

1. Select any function node
2. The Function Toolbar will appear in the right sidebar
3. You'll see sections for:
   - **Rule Editor** - Create new rules
   - **Rules List** - Manage existing rules

## Creating Rules

### Basic Rule Structure

Rules have three main components:

#### Inputs

- Select source nodes and their properties
- Use the autocomplete to pick from available nodes
- Choose properties like `id`, `label`, or metadata keys

#### Expression

- Write mathematical expressions using `arguments[0]`, `arguments[1]`, etc.
- Each argument corresponds to an input in order
- Supports JavaScript math operations: `+`, `-`, `*`, `/`, `Math.pow()`, etc.

#### Outputs (Optional)

- Define where to write results back
- Select target nodes and properties
- Results will update the target property when the rule evaluates

### Example Workflows

#### Example 1: Simple Addition

1. Create a Calculator function node
2. Create two key-value nodes with numeric values
3. Create a rule:
   - **Input 1**: First node → `value` property
   - **Input 2**: Second node → `value` property
   - **Expression**: `arguments[0] + arguments[1]`
   - **Output**: Calculator node → `result` property
4. Click "Evaluate Rule" to see the sum appear in the calculator's metadata

#### Example 2: Data Processing Chain

1. Create a Data Processor function node
2. Create input data and config nodes
3. Create a rule:
   - **Input 1**: Input node → `value`
   - **Input 2**: Config node → `multiplier`
   - **Expression**: `arguments[0] * arguments[1]`
   - **Output**: Processor node → `processed`

#### Example 3: Complex Calculations

```javascript
// Square root of sum of squares
Math.sqrt(Math.pow(arguments[0], 2) + Math.pow(arguments[1], 2))(
  // Percentage calculation
  arguments[0] / arguments[1]
) * 100;

// Conditional logic
arguments[0] > arguments[1] ? arguments[0] : arguments[1];
```

## Property Reference

When selecting node properties, you can access:

- **`id`** - Node's unique identifier
- **`label`** - Node's display name
- **`type`** - Node type ("function" or "key_value")
- **Metadata keys** - For key-value nodes: the key names
- **Function parameters** - For function nodes: parameter keys

## Managing Rules

### Saving Rules

- Rules are automatically saved to the function node's metadata
- Each rule gets a unique description you provide
- Rules persist when you save/load the project

### Evaluating Rules

- Click "Evaluate Rule" to run the calculation
- Results appear in the "Rule Result" section
- If you defined an output, the target property will be updated

### Deleting Rules

- Use the "Delete" button next to any rule in the Rules List
- This removes the rule from the function node permanently

## Tips and Best Practices

1. **Use descriptive rule descriptions** - This helps identify rules later
2. **Test expressions before saving** - Use the evaluate function to verify logic
3. **Start simple** - Begin with basic arithmetic before complex expressions
4. **Use outputs strategically** - Write results back to create data flow chains
5. **Check the console** - Look for any evaluation errors or warnings

## Troubleshooting

### Common Issues

**"No nodes available"**

- Make sure you have created other nodes in your graph
- The current function node won't appear in its own input list

**Expression errors**

- Check JavaScript syntax (parentheses, operators)
- Verify argument indices match your input count
- Use browser dev tools console for detailed error messages

**Missing properties**

- Refresh the property list by re-selecting inputs
- Ensure target nodes have the expected metadata structure

### Getting Help

- Check the browser console for detailed error messages
- Verify your expressions work in a JavaScript console first
- Start with simple rules and add complexity gradually

## Advanced Features

### Chaining Rules

Create multiple function nodes with rules that feed into each other:

1. Node A processes raw input
2. Node B takes Node A's output as input
3. Node C aggregates results from multiple nodes

### Dynamic Updates

- Rules can reference any node property
- When source data changes, re-evaluate rules to propagate updates
- Use this to create reactive data processing pipelines

This rule system enables powerful data transformation and calculation workflows within your graph structure!
