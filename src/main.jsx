import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PropTypes from "prop-types";

const inputType = {
	number: 'number', string: 'text', password: 'password',
}

function useForm(submitHandle, initialValues) {
	const [values, setValues] = useState(initialValues || {});
	const allowValidate = useRef(false);
	const [errors, setErrors] = useState({});
	const errorsRuntime = useRef({});

	const handleChange = (ev) => {
		ev.persist();
		setValues(state => ({
			...state, [ev.target.id]: ev.target.value
		}))
		if (!allowValidate.current) return;
		validation(ev?.target);
	}

	const validationAll = () => {
		const allValues = Object.keys(values);
		let validAll = true;
		for (const item of allValues) {
			const validationElement = document.getElementById(item);
			if (!validationElement) continue;
			validAll &= validation(validationElement);
		}

		return validAll;
	}
	const validation = (element) => {
		switch (element?.type) {
			case inputType.string:
			case inputType.password:
				if (!requireValidation(element)) return false;
				if (!minValidation(element)) return false;
				if (!maxValidation(element)) return false;
				if (!emailValidation(element)) return false;
				break;
			default:
				break;
		}
		switch (element.tagName) {
			case 'TEXTAREA':
				if (!requireValidation(element)) return false;
				if (!minValidation(element)) return false;
				if (!maxValidation(element)) return false;
				if (!emailValidation(element)) return false;
				break;
			default:
				break;
		}

		// clear error
		clearError(element)
		return true;
	}
	const clearError = (inputElement) => {
		const newErrors = {...errorsRuntime.current};
		delete newErrors[inputElement.id];
		setErrors(newErrors);
		errorsRuntime.current = newErrors;
	}
	const addErrors = (inputElement, errorString) => {
		const newErrors = {
			...errorsRuntime.current, [inputElement.id]: errorString
		};
		errorsRuntime.current = newErrors;
		setErrors(newErrors);
	}
	const requireValidation = (inputElement) => {
		const requireArray = JSON.parse(inputElement?.dataset?.require || '[]');
		const requireValid = inputElement?.value?.length || inputElement?.value?.length > 0
		if (requireValid) return true;
		const [, errorMessage] = requireArray;
		if (!inputElement.value) {
			addErrors(inputElement, errorMessage)
			return false;
		}
		return true;
	}
	const minValidation = (inputElement) => {
		const minArray = JSON.parse(inputElement?.dataset.min || '[]');
		if (minArray.length <= 0) return true;
		const [minNumber, errorMessage] = minArray;
		const minValid = inputElement?.value && inputElement?.value?.length >= minNumber;
		if (minValid) {
			return true;
		} else if (!minValid) {
			addErrors(inputElement, errorMessage)
			return false;
		}
	}
	const maxValidation = (inputElement) => {
		const maxArray = JSON.parse(inputElement?.dataset.max || '[]');
		if (maxArray.length <= 0) return true;
		const [maxNumber, errorMessage] = maxArray;
		const maxValid = inputElement?.value && inputElement?.value?.length <= maxNumber;
		if (maxValid) {
			return true;
		} else if (!maxValid) {
			addErrors(inputElement, errorMessage)
			return false;
		}
	}
	const emailValidation = (inputElement) => {
		const maxArray = JSON.parse(inputElement?.dataset.email || '[]');
		if (maxArray.length <= 0) return true;
		const [, errorMessage] = maxArray;
		const emailValid = isValidEmail(inputElement?.value);
		if (emailValid) {
			return true;
		} else if (!emailValid) {
			addErrors(inputElement, errorMessage)
			return false;
		}
	}
	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	const onSubmit = (ev) => {
		ev.preventDefault();
		let valid = true;
		allowValidate.current = true;
		allowValidate.current && (valid = validationAll());
		valid && submitHandle(values, ev);
	}
	const register = (name) => {
		if (!Object.keys(values).find((item) => item === name)) {
			setValues((state) => ({
				...state, [name]: '',
			}));
		}
		return {
			onChange: handleChange, id: name
		}
	}

	return [register, onSubmit, errors];
}

const contactControl = {
	to: 'To', title: 'Title', message: 'Message',
}

function InputGroup(props) {
	const {
		name, value, onChange, id, require, error, email
	} = props;
	const classError = error ? 'error' : ''
	return (<div className={`form-group`}>
		<label className={classError} htmlFor={id}>
			{name}
		</label>
		<input
			className={classError}
			id={id}
			value={value}
			onChange={onChange}
			type='text'
			data-require={JSON.stringify(require)}
			data-email={JSON.stringify(email)}
		/>
		<div className={`error`}>
			{error}
		</div>
	</div>)
}

InputGroup.propTypes = {
	name: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	require: PropTypes.array,
	error: PropTypes.node,
	email: PropTypes.array
}

function AreaGroup(props) {
	const {
		name, value, onChange, id, require, error
	} = props;
	const classError = error ? 'error' : ''
	return (<div className={`form-group`}>
		<label className={classError} htmlFor={id}>
			{name}
		</label>
		<textarea
			className={classError}
			id={id}
			value={value}
			onChange={onChange}
			data-require={JSON.stringify(require)}
		/>
		<div className={`error`}>
			{error}
		</div>
	</div>)
}

AreaGroup.propTypes = {
	name: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	require: PropTypes.array,
	error: PropTypes.node
}

function EmailForm() {
	const [file, setFile] = useState(null);
	const fileInputChangeHandle = (ev) => {
		setFile(ev.target.files[0])
	}
	const formSubmit = (values) => {
		const postData = {...values};
		postData.file = file;
		console.log(postData);
		alert('Sent successfully!!!')
	}
	const [register, onSubmit, errors] = useForm(formSubmit);

	return (<>
		<h1>Contact form</h1>
		<form onSubmit={onSubmit}>
			<InputGroup
				{...register(contactControl.to)}
				name={contactControl.to}
				require={[true, 'Require']}
				error={errors[contactControl.to]}
				email={[true, 'Email invalid']}
			/>
			<InputGroup
				{...register(contactControl.title)}
				name={contactControl.title}
				require={[true, 'Require']}
				error={errors[contactControl.title]}
			/>
			<AreaGroup
				{...register(contactControl.message)}
				name={contactControl.message}
				require={[true, 'Require']}
				error={errors[contactControl.message]}
			/>
			<div>
				<input onChange={fileInputChangeHandle} type="file"/>
			</div>

			<button className={`submit-button`} type="submit">Submit</button>
		</form>
	</>)
}

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode>
	<EmailForm/>
</React.StrictMode>,)
