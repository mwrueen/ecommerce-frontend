import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const RichTextEditor = React.forwardRef<ReactQuill, RichTextEditorProps>(
  ({ value, onChange, placeholder, className, disabled }, ref) => {

    const modules = useMemo(
      () => ({
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ color: [] }, { background: [] }],
          ["link"],
          ["clean"],
        ],
      }),
      []
    );

    const formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "color",
      "background",
      "link",
    ];

    return (
      <div className={cn("rich-text-editor-wrapper", className)}>
        <ReactQuill
          ref={ref}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className={cn(
            "rounded-lg border-2 border-input bg-background transition-all duration-200",
            "hover:border-primary/50 hover:shadow-sm",
            "[&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-b-2 [&_.ql-toolbar]:border-input [&_.ql-toolbar]:rounded-t-lg [&_.ql-toolbar]:bg-background",
            "[&_.ql-container]:border-0 [&_.ql-container]:rounded-b-lg",
            "[&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-sm",
            "[&_.ql-editor.ql-blank::before]:text-muted-foreground/60",
            "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 focus-within:shadow-md",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
