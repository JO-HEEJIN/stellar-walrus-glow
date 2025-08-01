interface SocialLinksProps {
  size?: 'small' | 'medium' | 'large'
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
  className?: string
}

export default function SocialLinks({ 
  size = 'medium', 
  orientation = 'horizontal', 
  showLabels = false,
  className = ''
}: SocialLinksProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  const containerClasses = orientation === 'horizontal' 
    ? 'flex space-x-4' 
    : 'flex flex-col space-y-3'

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/niainternational',
      hoverColor: 'hover:text-blue-500',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/nia_international',
      hoverColor: 'hover:text-pink-500',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 0C2.238 0 0 2.238 0 5v10c0 2.762 2.238 5 5 5h10c2.762 0 5-2.238 5-5V5c0-2.762-2.238-5-5-5H5zm6 13a3 3 0 110-6 3 3 0 010 6zm0-8a1 1 0 100-2 1 1 0 000 2zm5.5-1a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/nia-international',
      hoverColor: 'hover:text-blue-600',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com/@niainternational',
      hoverColor: 'hover:text-red-500',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm5.01 10.025c0 2.504-2.004 4.53-4.478 4.53H5.468C2.994 14.555.99 12.529.99 10.025V9.975c0-2.504 2.004-4.53 4.478-4.53h5.064c2.474 0 4.478 2.026 4.478 4.53v.05zM8 7v6l5-3-5-3z"/>
        </svg>
      )
    },
    {
      name: '카카오톡 채널',
      href: 'https://pf.kakao.com/_NiaInt',
      hoverColor: 'hover:text-yellow-500',
      icon: (
        <svg className={sizeClasses[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.486 0 0 3.343 0 7.5c0 2.614 1.69 4.929 4.257 6.257l-.857 3.171c-.096.357.266.638.566.438L7.257 15.5c.914.157 1.857.238 2.743.238 5.514 0 10-3.343 10-7.5S15.514 0 10 0z"/>
        </svg>
      )
    }
  ]

  return (
    <div className={`${containerClasses} ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-400 ${social.hoverColor} transition-colors duration-200 ${
            showLabels ? 'flex items-center space-x-2' : ''
          }`}
          title={social.name}
          aria-label={`Visit NIA INTERNATIONAL on ${social.name}`}
        >
          <span className="sr-only">{social.name}</span>
          {social.icon}
          {showLabels && (
            <span className="text-sm font-medium">{social.name}</span>
          )}
        </a>
      ))}
    </div>
  )
}