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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0]; // Minimum date in YYYY-MM-DD format

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
                console.log(data)
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
        // let hour = parseInt(time.split(":")[0]) + 2
        // const newTime = hour + ":" + time.split(":")[1]
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

    const generateClassTimes = () => {
        const classTimes = [];
        let currentTime = new Date();
        currentTime.setHours(7, 30, 0, 0); // Set initial time to 7:30 AM

        const maxTime = new Date();
        maxTime.setHours(19, 30, 0, 0); // Set maximum time to 9:00 PM

        while (currentTime <= maxTime) {
            const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            classTimes.push(timeString);

            // Add an hour and a half for the next class
            currentTime = new Date(currentTime.getTime() + 90 * 60000); // 90 minutes in milliseconds
        }

        return classTimes;
    };

    const setCurrentDateAvailability = (activity) => {
        const currentDate = new Date();
        const activityDate = new Date(activity.date);
        return currentDate < activityDate;
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
                    <select className="form-control" onChange={e => setTime(e.target.value)} id="time" value={time} required>
                        {generateClassTimes().map(hour => {
                            return (
                                <option key={hour} value={hour}>{hour}</option>
                            )
                        })}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Add Activity</button>
            </form>

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

export default AddActivity;
