import React, { useState, useRef } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import Button from '../button'

export default ({ label, options, selectedValues, onClickWithValue }) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef()
  return (
    <>
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(currentVal => !currentVal)}
        icon={<KeyboardArrowDownIcon />}>
        {label}
      </Button>
      <Menu
        anchorEl={buttonRef.current}
        getContentAnchorEl={null}
        open={isOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={() => setIsOpen(false)}>
        {options.map(({ value, label }) => (
          <MenuItem key={value} onClick={() => onClickWithValue(value)}>
            <span>{label || '(no label)'}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
