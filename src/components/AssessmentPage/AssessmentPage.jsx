import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import axios from 'axios';
import './AssessmentPage.css'; // CORRECTED: Import CSS without renaming the imported variable

const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend URL

const AssessmentPage = () => {
    const { moduleId, quizId } = useParams(); // Get parameters from the URL
    const navigate = useNavigate(); // Hook for programmatic navigation

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // To store user's answers
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null); // To store quiz score/feedback
    const [isSubmitted, setIsSubmitted] = useState(false); // To prevent multiple submissions

    // Get Learner ID from localStorage (same as in LearnerDashboard)
    const getLearnerId = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                return user.id;
            } catch (e) {
                console.error("Error parsing user data from localStorage:", e);
                return null;
            }
        }
        return null;
    };
    const learnerId = getLearnerId();

    useEffect(() => {
        if (!quizId || !moduleId || !learnerId) {
            setError("Missing quiz ID, module ID, or learner ID.");
            setLoading(false);
            return;
        }

        const fetchQuizDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch quiz details
                const quizResponse = await axios.get(`${API_BASE_URL}/api/quizzes/${quizId}`);
                setQuiz(quizResponse.data);

                // Fetch questions for this quiz
                const questionsResponse = await axios.get(`${API_BASE_URL}/api/quizzes/${quizId}/questions`);
                setQuestions(questionsResponse.data);

                // Initialize selected answers for radio buttons (multiple choice)
                const initialAnswers = {};
                questionsResponse.data.forEach(q => {
                    if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
                        initialAnswers[q.id] = null; // Initialize with no selection
                    } else if (q.question_type === 'short_answer') {
                        initialAnswers[q.id] = ''; // Initialize short answer with empty string
                    }
                    // For checkbox/multiple_select, initialize with an empty array if you implement it
                });
                setSelectedAnswers(initialAnswers);

            } catch (err) {
                console.error("Error fetching quiz details:", err);
                setError("Failed to load quiz. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizDetails();
    }, [quizId, moduleId, learnerId]); // Re-run if quizId, moduleId, or learnerId changes

    const handleAnswerChange = (questionId, value) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmitQuiz = async (e) => {
        e.preventDefault();
        if (isSubmitted) return; // Prevent double submission

        setIsSubmitted(true);
        setLoading(true); // Indicate submission is in progress
        setError(null);

        try {
            const submissionData = {
                user_id: learnerId,
                quiz_id: quizId,
                module_id: moduleId,
                answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
                    question_id: parseInt(questionId),
                    answer_text: answer // This will be the selected option ID or the short answer text
                }))
            };

            const response = await axios.post(`${API_BASE_URL}/api/quiz-submissions`, submissionData);
            setSubmissionResult(response.data); // This should contain score, feedback, etc.
            alert(`Quiz Submitted! Your score: ${response.data.score}/${response.data.total_questions}`);

            // Optionally, mark the module as complete if the quiz is passed
            // This is a design choice. You might do this on the backend or based on score.
            // For now, let's just show the result.
            // If quiz is passed, you *could* also trigger the mark complete API here.
            // E.g., if (response.data.passed) { await axios.patch(`/api/enrollments/${enrollmentId}/complete`); }

        } catch (err) {
            console.error("Error submitting quiz:", err.response ? err.response.data : err);
            setError(err.response?.data?.message || "Failed to submit quiz. Please try again.");
            setIsSubmitted(false); // Allow resubmission if error
        } finally {
            setLoading(false);
        }
    };

    const handleGoBackToDashboard = () => {
        navigate('/dashboard/learner'); // Navigate back to the learner dashboard
    };

    if (loading) {
        return <div className="assessment-page"><p>Loading assessment...</p></div>;
    }

    if (error) {
        return (
            <div className="assessment-page">
                <p className="error-message">{error}</p>
                <button className="btn-back-dashboard" onClick={handleGoBackToDashboard}>Back to Dashboard</button>
            </div>
        );
    }

    if (!quiz || questions.length === 0) {
        return (
            <div className="assessment-page">
                <p>No quiz found for this module or no questions available.</p>
                <button className="btn-back-dashboard" onClick={handleGoBackToDashboard}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="assessment-page">
            <button className="btn-back-dashboard" onClick={handleGoBackToDashboard}>
                &larr; Back to Dashboard
            </button>
            <h2>Assessment: {quiz.title}</h2>
            <p className="quiz-description">{quiz.description}</p>

            {!isSubmitted ? (
                <form onSubmit={handleSubmitQuiz} className="quiz-form">
                    {questions.map((question, index) => (
                        <div key={question.id} className="question-card">
                            <p className="question-number">Question {index + 1}:</p>
                            <p className="question-text">{question.question_text}</p>

                            {/* Render options based on question type */}
                            {question.question_type === 'multiple_choice' && (
                                <div className="options-container">
                                    {question.options.map(option => (
                                        <label key={option.id} className="option-label">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                value={option.id} // Store option ID as answer
                                                checked={selectedAnswers[question.id] === option.id}
                                                onChange={() => handleAnswerChange(question.id, option.id)}
                                                disabled={isSubmitted}
                                            />
                                            {option.option_text}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {question.question_type === 'true_false' && (
                                <div className="options-container">
                                    <label className="option-label">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value="true"
                                            checked={selectedAnswers[question.id] === "true"}
                                            onChange={() => handleAnswerChange(question.id, "true")}
                                            disabled={isSubmitted}
                                        />
                                        True
                                    </label>
                                    <label className="option-label">
                                        <input
                                            type="radio"
                                            name={`question-${question.id}`}
                                            value="false"
                                            checked={selectedAnswers[question.id] === "false"}
                                            onChange={() => handleAnswerChange(question.id, "false")}
                                            disabled={isSubmitted}
                                        />
                                        False
                                    </label>
                                </div>
                            )}

                            {question.question_type === 'short_answer' && (
                                <div className="short-answer-container">
                                    <textarea
                                        className="short-answer-input"
                                        value={selectedAnswers[question.id] || ''}
                                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                        placeholder="Type your answer here..."
                                        disabled={isSubmitted}
                                    ></textarea>
                                </div>
                            )}
                            {/* Add more question types (e.g., multiple_select/checkbox) here if needed */}
                        </div>
                    ))}
                    <button type="submit" className="submit-quiz-btn" disabled={loading || isSubmitted}>
                        {loading ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                </form>
            ) : (
                <div className="submission-result">
                    <h3>Quiz Results</h3>
                    {submissionResult ? (
                        <>
                            <p className="score">Your Score: {submissionResult.score} / {submissionResult.total_questions}</p>
                            <p className={submissionResult.passed ? "passed" : "failed"}>
                                Status: {submissionResult.passed ? "Passed!" : "Failed."}
                            </p>
                            {/* You can add more detailed feedback here, like correct/incorrect answers */}
                            {/* For example, by iterating through submissionResult.detailed_feedback if your API provides it */}
                        </>
                    ) : (
                        <p>No submission result available. Please try submitting again or contact support.</p>
                    )}
                    <button className="btn-back-dashboard" onClick={handleGoBackToDashboard}>
                        Back to Dashboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default AssessmentPage;