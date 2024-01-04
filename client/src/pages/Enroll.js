import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Enroll = () => {
    const [code, setCode] = useState('');
    const [user, setUser] = useState({});
    const [activities, setActivities] = useState([]);
    const [refresh, setRefresh] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        async function fetchActivities(id) {
            const res = await fetch('http://localhost:3001/activities/');
            const data = await res.json()
            if (res.ok) {
                setActivities(data)
            }
        };
        if (token) {
            try {
                const data = jwtDecode(token);
                console.log(data)
                setUser(data.user);
                if (data.type != "student") navigate("/home");
                fetchActivities(data.user.id);
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, [refresh]);



    const handleSubmit = (event) => {
        event.preventDefault();
        fetch('http://localhost:3001/activities/' + user.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                
            }),
        })
            .then((response) => {
                if (response.ok) {
                    alert('Activity added successfully!');
                    setRefresh(!refresh);
                } else {
                    throw new Error('Error adding activity');
                }
            })
            .catch((error) => {
                alert('Error adding activity:', error);
            });
    };

    const setCurrentDateAvailability = (activity) => {
        const currentDate = new Date();
        const activityDate = new Date(activity.date);
        return currentDate < activityDate;
    };

    return (
        <div className="container m-5">
            <h2>Enroll</h2>
            <div onSubmit={handleSubmit}>
                 <div className="mb-3">
                    <label htmlFor="code" className="form-label">Code</label>
                    <input
                        type="text"
                        className="form-control"
                        id="code"
                        value={code} required
                        onChange={(e) => setCode(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Enroll to Activity</button>
            </div>

            <div className="row my-5" style={{ height: "100%", maxHeight: "400px", overflow: "scroll" }}>
                {activities.map((activity) => (
                    <div className="col-md-4 mb-3" key={activity.id}>
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h5 className="card-title">{activity.description}</h5>
                                <hr></hr>
                                <p className="card-text">{setCurrentDateAvailability(activity) ? 'Available' : 'Not available'}</p>
                                <p className="card-text">Code: {activity.code}</p>
                                <p className="card-text">Date: {new Date(activity.date).toLocaleDateString() + ", " + new Date(activity.date).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Enroll;
