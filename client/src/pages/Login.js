import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn) navigate('/home')
        const token = localStorage.getItem('token');
        if (token) {
            try {
                jwtDecode(token);
                setIsLoggedIn(true);
                navigate("/home");
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const handleSubmit = async () => {
        const response = await fetch('http://localhost:3001/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName, password
            })
        });
        const data = await response.json()
        console.log(data, response.ok)
        if (response.ok) {
            if (data.message && data.token && data.user) {
                setIsLoggedIn(true)
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user))
                localStorage.setItem('type', data.user.type)
                navigate("/home");
            }
        } else {
            console.error('' + data.message)
        }


    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <p className="text-center mt-4">No account? <a className='link m-3' href='/signup'>Sign up.</a></p>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">Login</h2>
                            <form>
                                <div className="form-group">
                                    <label htmlFor="email">Username:</label>
                                    <input required value={userName} onChange={e => setUserName(e.target.value)} type="text" name="userName" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password:</label>
                                    <input required value={password} onChange={e => setPassword(e.target.value)} type="password" name="password" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <button onClick={handleSubmit} type="button" className="btn btn-primary m-3">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;