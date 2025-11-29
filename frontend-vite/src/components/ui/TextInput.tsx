import React from 'react';
import '../../styles/components/_inputs.scss';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, error, ...rest }) => {
    return (
        <div className="ui-input">
            <label className="ui-input__label">
                {label}
            </label>
            <input className="ui-input__field" {...rest} />
            {error && <p className="ui-input__error">{error}</p>}
        </div>
    );
};

export default TextInput;
