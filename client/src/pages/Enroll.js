import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Enroll = () => {
    const [code, setCode] = useState('');
    const [user, setUser] = useState({});
    const [activities, setActivities] = useState([]);
    const [myActivities, setMyActivities] = useState([]);
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
        async function fetchMyActivities(id) {
            const res = await fetch('http://localhost:3001/activities/users/' + id + "/enrollment", {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                },
            });
            const data = await res.json()
            if (res.ok) {
                setMyActivities(data)
            }
        };
        if (token) {
            try {
                const data = jwtDecode(token);
                console.log(data)
                setUser(data.user);
                if (data.type != "student") navigate("/home");
                fetchActivities(data.user.id);
                fetchMyActivities(data.user.id);
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, [refresh]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const res = await fetch('http://localhost:3001/users/' + user.id + "/enroll", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                code
            }),
        });
        const data = await res.json()
        if (res.ok) {
            alert('Enrolled to activity successfully!');
            setRefresh(!refresh);
        } else {
            alert('Error adding activity: ' + data.message);
        }
    };

    const setCurrentDateAvailability = (activity) => {
        const currentDate = new Date();
        const activityDate = new Date(activity.date);
        const activityDurationMs = 90 * 60 * 1000; // Activity duration in milliseconds (1h 30min)

        const currentDateUTC = currentDate.toISOString();
        const activityDateUTC = activityDate.toISOString();
        if (currentDateUTC > activityDateUTC && currentDateUTC < new Date(activityDate.getTime() + activityDurationMs).toISOString()) {
            return 'Happening right now';
        }
        if (currentDateUTC < activityDateUTC) {
            return 'Available';
        } 
         else {
            return 'Expired';
        }
    };


    return (
        <div className="container m-5">
            <h2>Enroll</h2>
            <div>
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
                <button type="button" onClick={handleSubmit} className="btn btn-primary">Enroll to Activity</button>
            </div>

            <div className="row my-5" style={{ height: "100%", maxHeight: "400px", overflow: "scroll" }}>
                <h2>All activities</h2>
                {activities.map((activity) => (
                    <div className="col-md-4 mb-3" key={activity.id}>
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h5 className="card-title">{activity.description}</h5>
                                <hr></hr>
                                <p className="card-text">{setCurrentDateAvailability(activity)}</p>
                                <p className="card-text">Code: {activity.code}</p>
                                <p className="card-text">Date: {new Date(activity.date).toLocaleDateString() + ", " + new Date(activity.date).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row my-5" style={{ height: "100%", maxHeight: "400px", overflow: "scroll" }}>
                <h2>My current activities</h2>
                {myActivities.map((activity) => (
                    <div className="col-md-4 mb-3" key={activity.id} onClick={()=>{
                        const status = setCurrentDateAvailability(activity)
                        if(status === 'Happening right now') navigate("/activity/" + activity.id)}}>
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h5 className="card-title">{activity.description}</h5>
                                <hr></hr>
                                <p className="card-text">{setCurrentDateAvailability(activity)}</p>
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
