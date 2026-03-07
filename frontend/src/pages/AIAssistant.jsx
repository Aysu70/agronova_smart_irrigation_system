import React from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import AIChatBot from '../components/ai/AIChatBot';

const AIAssistant = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Navbar title="AI Agriculture Assistant" />
        <div className="p-8 mt-16">
          <div className="max-w-4xl mx-auto">
            {/* Info Section */}
            <div className="mb-6 bg-primary-50 border border-primary-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                🤖 Your Smart Farming Assistant
              </h3>
              <p className="text-primary-700 mb-4">
                Ask me anything about agriculture! I can help with:
              </p>
              <ul className="grid grid-cols-2 gap-2 text-primary-700 text-sm">
                <li>✓ Crop cultivation techniques</li>
                <li>✓ Irrigation management</li>
                <li>✓ Soil health & fertilization</li>
                <li>✓ Pest & disease control</li>
                <li>✓ Weather planning</li>
                <li>✓ Organic farming practices</li>
              </ul>
              <p className="text-sm text-primary-600 mt-4">
                <strong>Note:</strong> This assistant only answers agriculture-related questions.
              </p>
            </div>

            {/* Chat Bot */}
            <AIChatBot />

            {/* Sample Questions */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">💡 Sample Questions</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• "What's the best irrigation schedule for tomatoes?"</p>
                <p>• "How do I improve soil pH naturally?"</p>
                <p>• "What are the signs of nitrogen deficiency in crops?"</p>
                <p>• "How can I control aphids organically?"</p>
                <p>• "When is the best time to plant corn?"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
