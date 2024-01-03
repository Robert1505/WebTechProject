import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [type, setType] = useState('student');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const handleUserTypeChange = (e) => {
        setType(e.target.value);
    };

    const insertUser = (values) => {
        fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numeUtilizator: values.numeUtilizator,
                userName, password, type
            }),
        })
            .then((response) => {
                if (response.ok) {
                    console.log(`${type} signed up!`);
                    navigate('/login');
                } else {
                    throw new Error();
                }
            })
            .catch((e) => console.error('Wrong credentials!'));
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-3">Sign up</h2>
            <div className="form-group d-flex justify-content-center">
                <label htmlFor="userType" className="mx-3">Type:</label>
                <select
                    id="userType"
                    value={type}
                    onChange={handleUserTypeChange}
                    className="form-control w-25"
                    style={{ minWidth: '150px' }}
                >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>
            <p className="text-center mt-4">Do you have an account?<a className='link m-3' href='/login'>Login.</a></p>
            {type && <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="card-title">Sign up</h2>
                                <form>
                                    <div className="form-group">
                                        <label>First name:</label>
                                        <input value={firstName} onChange={e => setFirstName(e.target.value)}
                                        type="text" name="firstName" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last name:</label>
                                        <input value={lastName} onChange={e => setLastName(e.target.value)}
                                        type="text" name="lastName" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Username:</label>
                                        <input value={userName} onChange={e => setUserName(e.target.value)}
                                        type="email" name="numeUtilizator" className="form-control" />
                                    </div>
                                    <div className="form-group">
                                        <label>Password:</label>
                                        <input value={password} onChange={e => setPassword(e.target.value)} 
                                        type="password" name="parola" className="form-control" />
                                    </div>
                                    <button type="button" onClick={insertUser} className="btn btn-primary">
                                        Sign up
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default Signup;