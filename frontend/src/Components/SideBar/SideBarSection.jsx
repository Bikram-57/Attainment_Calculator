import React from 'react'

function SideBarSection({ icon: Icon, text, sectionClassNames}) {
    return (
        <div className={sectionClassNames || 'flex items-center gap-1 my-2 text-lg'}>
            <Icon />
            <div>
                {text}
            </div>
        </div>
    )
}

export default SideBarSection