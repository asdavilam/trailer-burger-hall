import { useState } from 'react'

type DaySelectorProps = {
    name: string
    initialDays: number[]
    color: 'blue' | 'green'
    disabled?: boolean
}

const DAYS = [
    { id: 1, label: 'L', name: 'Lunes' },
    { id: 2, label: 'M', name: 'Martes' },
    { id: 3, label: 'M', name: 'Miércoles' },
    { id: 4, label: 'J', name: 'Jueves' },
    { id: 5, label: 'V', name: 'Viernes' },
    { id: 6, label: 'S', name: 'Sábado' },
    { id: 0, label: 'D', name: 'Domingo' },
]

export function DaySelector({ name, initialDays, color, disabled = false }: DaySelectorProps) {
    const [selectedDays, setSelectedDays] = useState<number[]>(initialDays)

    const toggleDay = (dayId: number) => {
        if (disabled) return
        if (selectedDays.includes(dayId)) {
            setSelectedDays(selectedDays.filter(d => d !== dayId))
        } else {
            setSelectedDays([...selectedDays, dayId])
        }
    }

    const activeClass = color === 'blue' ? 'bg-blue-600 text-white border-blue-600' : 'bg-green-600 text-white border-green-600'
    const inactiveClass = 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
    const disabledClass = 'opacity-50 cursor-not-allowed'

    return (
        <div>
            <div className="flex gap-2 flex-wrap">
                {DAYS.map(day => (
                    <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        disabled={disabled}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm transition-all 
                                    ${selectedDays.includes(day.id) ? activeClass : inactiveClass}
                                    ${disabled ? disabledClass : ''}`}
                        title={day.name}
                    >
                        {day.label}
                    </button>
                ))}
            </div>
            <input type="hidden" name={name} value={JSON.stringify(selectedDays)} />
        </div>
    )
}
