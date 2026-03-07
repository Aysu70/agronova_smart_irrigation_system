import React, { useState } from 'react';
import Card from '../common/Card';
import { MessageCircle, CheckCircle, User } from 'lucide-react';
import { timeAgo, getInitials, getAvatarColor } from '../../utils/helpers';

const QuestionCard = ({ question, onAddAnswer, onMarkBest }) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onAddAnswer(question._id, answer);
      setAnswer('');
      setShowAnswerForm(false);
    }
  };

  const bestAnswer = question.answers.find(a => a.isBestAnswer);

  return (
    <Card hover>
      <div className="space-y-4">
        {/* Question Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{question.title}</h3>
          <p className="text-gray-600">{question.content}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full ${getAvatarColor(question.user.name)} flex items-center justify-center`}>
                <span className="text-white text-xs">
                  {getInitials(question.user.name)}
                </span>
              </div>
              <span>{question.user.name}</span>
            </div>
            <span>{timeAgo(question.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>{question.answers.length} answers</span>
          </div>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Best Answer */}
        {bestAnswer && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Best Answer</span>
            </div>
            <p className="text-gray-700">{bestAnswer.content}</p>
            <div className="mt-2 text-sm text-gray-600">
              by {bestAnswer.user.name}
            </div>
          </div>
        )}

        {/* Other Answers */}
        {question.answers.filter(a => !a.isBestAnswer).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Other Answers</h4>
            {question.answers
              .filter(a => !a.isBestAnswer)
              .map((ans) => (
                <div key={ans._id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700">{ans.content}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">by {ans.user.name}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Add Answer */}
        {!showAnswerForm ? (
          <button
            onClick={() => setShowAnswerForm(true)}
            className="w-full py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Add Answer
          </button>
        ) : (
          <form onSubmit={handleSubmitAnswer} className="space-y-2">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowAnswerForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </Card>
  );
};

export default QuestionCard;
