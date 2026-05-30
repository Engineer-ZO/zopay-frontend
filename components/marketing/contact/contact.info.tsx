import { MapPin, Clock, Globe } from 'lucide-react'

const offices = [
  {
    icon: MapPin,
    region: 'Headquarters',
    location: 'Yaoundé, Cameroon',
    address: '123 Business Street, Downtown',
    phone: '+237 6XX XXX XXX',
  },
  {
    icon: MapPin,
    region: 'West Africa Office',
    location: 'Lagos, Nigeria',
    address: '456 Technology Avenue, Victoria Island',
    phone: '+234 8XX XXX XXX',
  },
  {
    icon: Clock,
    region: 'Business Hours',
    location: 'Monday - Friday',
    address: '9:00 AM - 6:00 PM CAT',
    phone: 'Saturday by appointment',
  },
  {
    icon: Globe,
    region: 'Coverage Area',
    location: 'Pan-African',
    address: 'Operating in 50+ African countries',
    phone: 'Available globally',
  },
]

export default function ContactInfo() {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">Contact Information</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {offices.map((office) => {
          const Icon = office.icon
          return (
            <div
              key={office.region}
              className="rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-accent/50 transition-all"
            >
              <div className="flex gap-3 mb-3">
                <Icon className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-foreground">{office.region}</h4>
                  <p className="text-sm font-semibold text-primary">{office.location}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-foreground/70">{office.address}</p>
                <p className="text-foreground/70">{office.phone}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
