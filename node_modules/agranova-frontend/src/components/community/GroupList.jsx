import React from 'react';
import Card from '../common/Card';
import { Users, Lock, Unlock } from 'lucide-react';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const GroupList = ({ groups, onGroupSelect, selectedGroup, onJoinGroup }) => {
  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isMember = group.members.some(m => m._id === selectedGroup?._id);
        
        return (
          <Card 
            key={group._id} 
            hover 
            onClick={() => isMember && onGroupSelect(group)}
            className={selectedGroup?._id === group._id ? 'ring-2 ring-primary-500' : ''}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-lg ${getAvatarColor(group.name)} flex items-center justify-center`}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900">{group.name}</h4>
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{group.members.length} members</p>
                </div>
              </div>
              
              {!isMember && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinGroup(group._id);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Join
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default GroupList;
