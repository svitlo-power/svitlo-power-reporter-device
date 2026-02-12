import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, ...props }) => {
    return (
        <div className="input-group">
            <label>{label}</label>
            <textarea
                className="input-style"
                style={{ resize: 'vertical', minHeight: '100px' }}
                {...props}
            />
        </div>
    );
};
