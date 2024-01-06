import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AddActivity = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [user, setUser] = useState({});
    const [activities, setActivities] = useState([]);
    const [refresh, setRefresh] = useState(false);

    // Get tomorrow's date in the format YYYY-MM-DD
    const today = new Date();
    today.setDate(today.getDate());
    const minDate = today.toISOString().split('T')[0]; // Minimum date in YYYY-MM-DD format

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        async function fetchActivities(id) {
            const res = await fetch('http://localhost:3001/activities/users/' + id, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                }
            });
            const data = await res.json()
            if (res.ok) {
                setActivities(data)
            }
        };
        if (token) {
            try {
                const data = jwtDecode(token);
                setUser(data.user);
                if (data.type != "teacher") navigate("/home");
                fetchActivities(data.user.id);
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, [refresh]);



    const handleSubmit = (event) => {
        event.preventDefault();
        if (new Date(date + "T" + time) < today) {
            alert("The activity's time is cannot be before the current time.");
            return;
        }
        fetch('http://localhost:3001/activities/' + user.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                title, description, code, date: date + "T" + time
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
            <h2>Add Activity</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title} required
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        type="text"
                        className="form-control"
                        id="description"
                        value={description} required
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
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
                <div className="mb-3">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                        type="date"
                        className="form-control"
                        id="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        min={minDate}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="time" className="form-label">Time</label>
                    <input
                        type="time" className="form-control" onChange={e => setTime(e.target.value)} id="time" value={time} required
                        min="07:00"
                        max="19:00"
                        pattern="^(0[7-9]|1[0-8]):[0-5][0-9]$"
                        title="Please enter a valid time between 07:00 and 19:00"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Add Activity</button>
            </form>

            <div className="row my-5" style={{ height: "100%", maxHeight: "400px", overflow: "scroll" }}>
                {activities.map((activity) => (
                    <div className="col-md-4 mb-3" key={activity.id} onClick={()=> navigate("/activity/" + activity.id+"/feedback")}>
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h5 className="card-title">{activity.title}</h5>
                                <hr></hr>
                                <p className="card-text">{setCurrentDateAvailability(activity)}</p>
                                <p className="card-text">Description: {activity.description}</p>
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

export default AddActivity;
