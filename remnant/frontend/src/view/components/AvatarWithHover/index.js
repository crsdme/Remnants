import React, { useState } from 'react';
import { Avatar } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const AvatarWithHover = ({ icon, hoveredIcon, color, hoveredColor, size, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAvatarHover = () => {
    setIsHovered(true);
  };

  const handleAvatarMouseLeave = () => {
    setIsHovered(false);
  };

  const getIcon = () => (isHovered ? hoveredIcon : icon);

  const getColor = () => (isHovered ? hoveredColor : color);

  return (
    <Avatar
      style={{
        backgroundColor: getColor(),
      }}
      size={size}
      icon={getIcon()}
      onClick={onClick}
      onMouseOver={handleAvatarHover}
      onMouseLeave={handleAvatarMouseLeave}
    />
  );
};

export default AvatarWithHover;
