import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import MarkdownViewer from './index';

type Props = {
  source: string;
  type: 'json' | 'markdown';
  onChange?: (value: string) => void;
  placeholder?: string;
}

const EditableMarkdownViewer = ({ source, type, onChange, placeholder }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(source);
  const isEmpty = !source || source.trim() === '';

  const handleSave = () => {
    onChange?.(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(source);
    setIsEditing(false);
  };

  if (isEmpty || isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          placeholder={placeholder || (type === 'json' ? 'Enter JSON data...' : 'Enter markdown...')}
          className="min-h-32 w-full font-mono text-sm"
        />
        {isEditing && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <MarkdownViewer
        value={source}
        type={type}
        editable={false}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setTempValue(source);
          setIsEditing(true);
        }}
      >
        Edit
      </Button>
    </div>
  );
};

export default EditableMarkdownViewer;
