import * as React from 'react'
import { Room } from '../room'
import {
  moveToRoom,
  getNetworkMediaChatStatus
} from '../networking'
import NameView from './NameView'
import { DispatchContext, UserMapContext } from '../App'
import { StopVideoChatAction, ShowModalAction, PrepareToStartVideoChatAction } from '../Actions'
import { FaVideo } from 'react-icons/fa'
import { Stage, Layer, Star, Text, Rect } from 'react-konva'
import '../../style/room.css'
import { Modal } from '../modals'
import Konva from 'konva'

interface Props {
  room?: Room;
  userId?: string;
}

export default function RoomView (props: Props) {
  const dispatch = React.useContext(DispatchContext)
  const { room } = props

  // This is very silly.
  // Since we're manually setting raw HTML, we can't get refs to add proper click handlers
  // Instead, we just hijack ALL clicks in the description, and check if they're for a link
  const descriptionClick = (e) => {
    const roomId =
      e.target && e.target.getAttribute && e.target.getAttribute('data-room')
    if (roomId) {
      moveToRoom(roomId)
    }
  }

  const joinVideoChat = async () => {
    dispatch(PrepareToStartVideoChatAction())
  }

  const leaveVideoChat = () => {
    dispatch(StopVideoChatAction())
  }

  const showNoteWall = () => {
    dispatch(ShowModalAction(Modal.NoteWall))
  }

  let noteWallView
  if (room && room.hasNoteWall) {
    noteWallView = <div>One of the walls has space for attendees to put up sticky notes. <button onClick={showNoteWall}>View note wall</button></div>
  }

  let videoChatButton
  if (room && room.allowsMedia) {
    if (getNetworkMediaChatStatus()) {
      videoChatButton = (
        <button onClick={leaveVideoChat} id='join-video-chat'>
          Leave Video Chat
        </button>
      )
    } else {
      videoChatButton = (
        <button onClick={joinVideoChat} id='join-video-chat'>
          Join Video Chat (Beta) {room.videoUsers && room.videoUsers.length > 0 ? `(${room.videoUsers.length})` : ''}
        </button>
      )
    }
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div id="room">
      <h1 id="room-name">{room ? room.name : 'Loading...'}{videoChatButton}</h1>
      <div
        id="static-room-description"
        onClick={descriptionClick}
        dangerouslySetInnerHTML={{
          __html: room
            ? parseDescription(room.description)
            : 'Loading current room...'
        }}
      />
      {room ? <PresenceView users={room.users} userId={props.userId} videoUsers={room.videoUsers} /> : ''}
      {noteWallView}
    </div>
  )
}

const PresenceView = (props: { users?: string[]; userId?: string, videoUsers: string[] }) => {
  let { users, userId, videoUsers } = props

  // Shep: Issue 43, reminder to myself that this is the code making sure users don't appear in their own client lists.
  if (users && userId) {
    users = users.filter((u) => u !== userId)
  }

  if (users) {
    // TODO: This should happen in the reducer
    let names

    const userViews = users.map((u, idx) => {
      const id = `presence-${idx}`
      if (videoUsers && videoUsers.includes(u)) {
        return <span><NameView userId={u} id={id} key={id} /> <FaVideo /></span>
      } else {
        return <NameView userId={u} id={id} key={id} />
      }
    })

    if (users.length === 1) {
      names = userViews[0]
    } else if (users.length === 2) {
      names = (
        <span>
          {userViews[0]} and {userViews[1]}
        </span>
      )
    } else {
      names = (
        <span>
          {intersperse(userViews.slice(0, users.length - 1), ', ')}, and{' '}
          {userViews[userViews.length - 1]}
        </span>
      )
    }

    const { userMap, myId } = React.useContext(UserMapContext)
    const roomCanvasWidth = 300
    const roomCanvasHeight = 100
    const userRefs = []
    
    React.useEffect(() => {
      userRefs.map((text) => {
        console.log(text.getX())
        if (text.getX() < 9) {
          text.to({
            x: Math.floor(Math.random() * (roomCanvasWidth - 20 - text.getWidth()) + 10),
            y: Math.floor(Math.random() * (roomCanvasHeight - 20 - text.getHeight()) + 10),
            duration: 2
          })
        }
      })
    })

    return (
      <div id="dynamic-room-description">
        <Stage width={roomCanvasWidth} height={roomCanvasHeight}>
          <Layer>
            <Rect
              x={10}
              y={10}
              width={roomCanvasWidth - 20}
              height={roomCanvasHeight - 20}
              strokeWidth={1}
              stroke="white"
            />
            {
              users.map((user) => 
                <Text
                  ref={(instance) => { userRefs.push(instance) }}
                  key={user}
                  text={userMap[user].username}
                  stroke='white'
                  fill='white'
                  strokeWidth={0}
                  x={0}
                  y={50}
                />
              )
            }
            <Text
              ref={(instance) => { userRefs.push(instance) }}
              key={myId}
              text={userMap[myId].username}
              stroke='white'
              fill='white'
              strokeWidth={0}
            />
          </Layer>
        </Stage>
      </div>
    )
  } else {
    return <div id="dynamic-room-description" />
  }
}

// https://stackoverflow.com/questions/23618744/rendering-comma-separated-list-of-links
/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */
function intersperse (arr, sep) {
  if (arr.length === 0) {
    return []
  }

  return arr.slice(1).reduce(
    function (xs, x, i) {
      return xs.concat([sep, x])
    },
    [arr[0]]
  )
}

function parseDescription (description: string): string {
  // eslint-disable-next-line no-useless-escape
  const complexLinkRegex = /\[\[([^\]]*?)\-\>([^\]]*?)\]\]/g
  const simpleLinkRegex = /\[\[(.+?)\]\]/g

  description = description.replace(complexLinkRegex, (match, text, roomId) => {
    return `<a class='room-link' href='#' data-room='${roomId}'>${text}</a>`
  })

  description = description.replace(simpleLinkRegex, (match, roomId) => {
    return `<a class='room-link' href='#' data-room='${roomId}'>${roomId}</a>`
  })
  return description
}
