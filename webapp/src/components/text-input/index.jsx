import React, { forwardRef } from 'react'
import TextField from '@material-ui/core/TextField'

export default forwardRef((props, ref) => (
  <TextField variant="outlined" ref={ref} {...props} />
))
