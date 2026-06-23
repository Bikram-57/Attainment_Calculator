import React from 'react'
import { COLORS } from '../../constants/theme'
import { NavLink } from 'react-router-dom'

function SideBarTab({ icon: Icon, to, text, tabClassNames }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => (
                `${isActive ? 'font-bold' : ''} ${tabClassNames || 'flex items-center gap-1 mt-2 px-6'}`
            )}
            style={({ isActive }) => ({
                backgroundColor: isActive ? COLORS.mintDark : 'transparent',
                color: COLORS.font
            })}
        >
            <Icon />
            <div>
                {text}
            </div>
        </NavLink>
    )
}

export default SideBarTab