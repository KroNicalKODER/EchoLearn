import React from 'react'
import Leaderboard from './Leaderboard'
import Aitutor from './Aitutor'
import Profile from './Profile'
import Videochat from './Videochat'
import { useSidebar } from '../contexts/SidebarContext'
import DailyChallenge from './DailyChallenge'
import Translate from './Translate'

const Main = () => {
    const { selectedItem } = useSidebar()
  return (
    <div className='my-10 sm:ml-13 mx-4 w-full'>
        {selectedItem === 'Leaderboard' && <Leaderboard />}
        {selectedItem === 'AI Tutor' && <Aitutor />}
        {selectedItem === 'Profile' && <Profile />}
        {selectedItem === 'Video Call' && <Videochat />}
        {selectedItem === 'Daily Challenge' && <DailyChallenge />}
        {selectedItem === 'Translate' && <Translate />}
    </div>
  )
}

export default Main
