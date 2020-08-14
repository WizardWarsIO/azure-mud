import React from 'react'
import { Room } from '../room'
import { moveToRoom } from '../networking'
import MenuButtonView from './MenuButtonView'
import { Stage, Layer, Star, Text } from 'react-konva'

import '../../style/nav.css'

interface Props {
  rooms: Room[];
  username: string;
}

function generateShapes () {
  return [...Array(4)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * 200,
    y: Math.random() * 200,
    rotation: Math.random() * 180,
    isDragging: false
  }))
}

const INITIAL_STATE = generateShapes()

export default function RoomListView (props: Props) {
  const stars = generateShapes()
  console.log('STARS')
  console.log(stars)

  return (
    <nav id="side-menu" role="navigation" aria-label="List of rooms you can navigate to">
      <MenuButtonView username={props.username} />
      <Stage width={200} height={200}>
        <Layer>
          <Text text="Try to drag a star" />
          {stars.map((star) => (
            <Star
              key={star.id}
              id={star.id}
              x={star.x}
              y={star.y}
              numPoints={5}
              innerRadius={20}
              outerRadius={40}
              fill="#89b717"
              opacity={0.8}
              draggable
              rotation={star.rotation}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.6}
              shadowOffsetX={star.isDragging ? 10 : 5}
              shadowOffsetY={star.isDragging ? 10 : 5}
              scaleX={star.isDragging ? 1.2 : 1}
              scaleY={star.isDragging ? 1.2 : 1}
            />
          ))}
        </Layer>
      </Stage>
    </nav>
  )
}

const RoomListItem = (props: { room: Room }) => {
  const { room } = props

  const onClick = () => {
    moveToRoom(room.id)
  }

  return (
    <li>
      <button onClick={onClick}>
        <strong>{room.name}</strong> {room.users ? `(${room.users.length})` : ''}
      </button>
    </li>
  )
}
