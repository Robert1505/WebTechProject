import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const ActivityDisplay = () => {
    const [feedbackInstances, setFeedbackInstances] = useState([]);
    const { id } = useParams();
    const [user, setUser] = useState({});
    const [refresh, setRefresh] = useState(false);
    const [activity, setActivity] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        async function fetchActivity() {
            const res = await fetch('http://localhost:3001/activities/' + id, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem("token")
                },
            });
            const data = await res.json()
            if (res.ok) {
                setActivity(data)
            }
        };
        if (token) {
            try {
                const data = jwtDecode(token);
                setUser(data.user);
                if (data.type != "student") navigate("/home");
                fetchActivity(data.user.id);
            } catch (e) {
                localStorage.removeItem('token');
                navigate("/login");
            }
        }
    }, [refresh]);

    const addFeedback = (reaction) => {
        fetch('http://localhost:3001/feedbacks/users/:userId/activities/:activityId' + user.id, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({
                userId: user.id,
                type: reaction,
                date: new Date()
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
        setFeedbackInstances();
    };

    return (
        <div className='m-5'>
            {/* Display Activity Details */}
            <div className="card shadow-lg m-5">
                <div className="card-body">
                    <h5 className="card-title">{activity.description}</h5>
                    <hr></hr>
                    {/* <p className="card-text">{setCurrentDateAvailability(activity)}</p> */}
                    <p className="card-text">Code: {activity.code}</p>
                    <p className="card-text">Date: {new Date(activity.date).toLocaleDateString() + ", " + new Date(activity.date).toLocaleTimeString()}</p>
                </div>
            </div>

            <h3>Send your feedback!</h3>
            <div className='emoticon-container'>
                <div className='row'>
                    <div className='col-6 border shadow'>
                        <button className='emoticon-button' onClick={() => addFeedback('smiley')}>😊</button>
                    </div>
                    <div className='col-6 border shadow'>
                        <button className='emoticon-button' onClick={() => addFeedback('frowny')}>☹️</button>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-6 border shadow'>
                        <button className='emoticon-button' onClick={() => addFeedback('surprised')}>😮</button>
                    </div>
                    <div className='col-6 border shadow'>
                        <button className='emoticon-button' onClick={() => addFeedback('confused')}>😕</button>
                    </div>
                </div>
            </div>

            {/* Display Feedback Instances */}
            <div>
                <h3>Feedback Instances:</h3>
                {feedbackInstances.map((feedback, index) => (
                    <div key={index}>
                        <p>{feedback.reaction} - {feedback.timestamp}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityDisplay;