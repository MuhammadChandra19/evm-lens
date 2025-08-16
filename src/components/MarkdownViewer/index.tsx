import Markdown from "@uiw/react-markdown-preview";
import { Textarea } from "@/components/ui/textarea";
import { getMarkdown } from "./helper";
import { useState } from "react";

type Props = {
  value: string;
  type: "json" | "markdown";
  onChange?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
};

const MarkdownViewer = ({
  value: source,
  type,
  onChange,
  placeholder,
  editable = true,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const isEmpty = !source || source.trim() === "";

  // Show textarea if source is empty or user is editing
  const shouldShowTextarea = editable && (isEmpty || isEditing);

  if (shouldShowTextarea) {
    return (
      <Textarea
        value={source}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={
          placeholder ||
          (type === "json" ? "Enter JSON data..." : "Enter markdown...")
        }
        className="h-40 w-full font-mono text-sm resize-none"
        onBlur={() => {
          // Switch back to preview mode if content is not empty
          if (!isEmpty) {
            setIsEditing(false);
          }
        }}
      />
    );
  }

  const markdown = getMarkdown(source, type);
  return (
    <div
      className="w-full h-40 relative cursor-pointer border rounded-md overflow-auto"
      onClick={() => editable && setIsEditing(true)}
      title={editable ? "Click to edit" : undefined}
    >
      <Markdown source={markdown} className="p-4 rel" />
    </div>
  );
};

export default MarkdownViewer;
