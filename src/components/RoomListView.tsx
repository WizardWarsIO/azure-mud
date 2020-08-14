import React from 'react'
import { Room } from '../room'
import { moveToRoom } from '../networking'
import MenuButtonView from './MenuButtonView'
import { Stage, Layer, Star, Text, Rect } from 'react-konva'

import '../../style/nav.css'

interface Props {
  currentRoom: Room;
  rooms: Room[];
  username: string;
}

export default function RoomListView (props: Props) {
  // TODO: Make this dynamic?
  const canvasWidth = 300
  const canvasHeight = 300

  // This is what we render before we get the actual data from the server
  if (!props.currentRoom) {
    return (
      <nav id="side-menu" role="navigation" aria-label="List of rooms you can navigate to">
        <MenuButtonView username={props.username} />
        <Stage width={canvasWidth} height={canvasHeight} />
      </nav>
    )
  }

  const centerX = canvasWidth / 2
  const centerY = canvasWidth / 2
  const roomWidth = 100
  const roomHeight = 100

  const currentPosition = props.currentRoom.position

  return (
    <nav id="side-menu" role="navigation" aria-label="List of rooms you can navigate to">
      <MenuButtonView username={props.username} />
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          {
            props.rooms.map((room) => (
              <Text
                key={room.id}
                x={5 + centerX - (roomWidth / 2) + ((room.position[0] - currentPosition[0]) * roomWidth)}
                y={5 + centerY - (roomHeight / 2) + ((room.position[1] - currentPosition[1]) * roomHeight)}
                width={roomWidth - 10}
                height={roomHeight - 10}
                stroke={'white'}
                fill={'white'}
                text={room.name + ' ' + (room.users ? `(${room.users.length})` : '')}
                fontSize={13}
                strokeWidth={0}
              />
            ))
          }
          {
            props.rooms.map((room) => {
              const onClick = () => {
                moveToRoom(room.id)
              }
              return (
                <Rect
                  key={room.id}
                  x={centerX - (roomWidth / 2) + ((room.position[0] - currentPosition[0]) * roomWidth)}
                  y={centerY - (roomHeight / 2) + ((room.position[1] - currentPosition[1]) * roomHeight)}
                  width={roomWidth}
                  height={roomHeight}
                  stroke={'white'}
                  onClick={onClick}
                />
              )
            })
          }
          {
            <Text
              key={props.username}
              x={centerX - (roomHeight / 2) + 5}
              y={centerY + (roomHeight / 2) - 17}
              width={roomWidth}
              height={roomHeight}
              stroke={'red'}
              fill={'red'}
              text={'YOU ARE HERE'}
              fontSize={12}
              strokeWidth={0}
            />
          }
        </Layer>
      </Stage>
    </nav>
  )
}

const RoomRect = (props: { room: Room }) => {
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
