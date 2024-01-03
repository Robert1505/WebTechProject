import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const AddActivity = () => {
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [date, setDate] = useState('');
    const [user, setUser] = useState({});
    const [activities, setActivities] = useState([]);
    const [dateTime, setDateTime] = useState('');

    // Get tomorrow's date in the format YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0]; // Minimum date in YYYY-MM-DD format
    
    // Function to check if the time is between 7:30 and 19:30
    const isTimeValid = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours >= 7 && hours <= 19 && (minutes == 30 || minutes == 0);
    };
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
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
    }, []);

    const fetchActivities = id => {
        fetch('http://localhost:3001/activities/users/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            }
        })
            .then((response) => response.json()
            ).then(data =>setActivities(data))
            .catch((error) => {
                 alert('Error fetching activities:', error);
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        fetch('http://localhost:3001/activities/' + user.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                description, code, date: dateTime
            }),
        })
            .then((response) => {
                if (response.ok) {
                    alert('Activity added successfully!');
                    fetchActivities(user.id);
                } else {
                    throw new Error('Error adding activity');
                }
            })
            .catch((error) => {
                alert('Error adding activity:', error);
            });
    };

    const checkTime = e => {
        const time = e.target.value.substring(11)
        if(isTimeValid(time)){
            setDateTime(e.target.value)
            console.log('ok')
        } else console.log('time ', time)
    }
    return (
        <div className="container m-5">
            <h2>Add Activity</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <input
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
                        type="datetime-local"
                        className="form-control"
                        id="date"
                        value={dateTime}
                        onChange={checkTime}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Add Activity</button>
            </form>

            <div className="row my-5">
                {activities.map((activity) => (
                    <div className="col-md-4 mb-3" key={activity.id}>
                        <div className="card shadow-lg">
                            <div className="card-body">
                                <h5 className="card-title">{activity.description}</h5>
                                <hr></hr>                       
                                <p className="card-text">Code: {activity.code}</p>
                                <p className="card-text">Date: {activity.date}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddActivity;
