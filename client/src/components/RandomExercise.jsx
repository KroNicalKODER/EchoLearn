import React, { useEffect } from 'react'
import axios from 'axios'

import config from  '../config'

const RandomExercise = () => {

  useEffect(()=>{
    axios.post(`${config.flask_url}/random_exercise`, {

    })
  }, [])

  return (
    <div>
      Random
    </div>
  )
}

export default RandomExercise
