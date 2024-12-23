'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { ChevronRight, BookOpen, LineChart, TrendingUp, UserCog, Users } from 'lucide-react';
import MaxWidthWrapper from './MaxWidthWrapper';

const UserOnboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const router = useRouter();

  const tradingLevels = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'New to trading, learning the basics',
      icon: BookOpen,
      image: 'https://www.dronakul.com/sitepad-data/uploads/2024/05/vecteezy_buy-or-sell-in-stock-market-and-crypto-currency-trading_.jpg'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'Familiar with trading concepts',
      icon: LineChart,
      image: '/intermediate.png'
    },
    {
      id: 'pro',
      title: 'Professional',
      description: 'Experienced trader with proven track record',
      icon: TrendingUp,
      image: 'https://tradebrains.in/wp-content/uploads/2020/10/How-to-do-Intraday-Trading-for-Beginners-In-India-cover.jpg'
    }
  ];

  const accountTypes = [
    {
      id: 'standard',
      title: 'Standard Trader',
      description: 'Access AI-powered trading suggestions and portfolio management',
      icon: Users,
      image: 'https://img.freepik.com/premium-vector/afro-american-business-man-teal-background-vector-illustration_24877-20228.jpg?uid=R176055277&ga=GA1.1.842935572.1732572644&semt=ais_hybrid'
    },
    {
      id: 'admin',
      title: 'Trade Admin',
      description: 'Manage multiple portfolios and create trading strategies',
      icon: UserCog,
      image: 'https://img.freepik.com/free-vector/network-businessminded-people_1308-37983.jpg?t=st=1734409314~exp=1734412914~hmac=b617be78b220e2688399010d6a0a46769857d63d528d18acacea232ba8b0e050&w=740'
    }
  ];

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setStep(2);
  };

  const handleAccountTypeSelect = (type: string) => {
    if (type === 'standard') {
      router.push('/ai-chats');
    } else {
      router.push('/trade-admin');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <MaxWidthWrapper>
        <div className="py-16">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3">Welcome! Let's get started</h1>
                <p className="text-gray-600">What's your trading experience level?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {tradingLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <Card
                      key={level.id}
                      className={`relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedLevel === level.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => handleLevelSelect(level.id)}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-full bg-purple-100">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">{level.title}</h3>
                        <p className="text-gray-600 text-sm">{level.description}</p>
                        <img
                          src={level.image}
                          alt={level.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <ChevronRight className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-3">Choose Your Account Type</h1>
                <p className="text-gray-600">Select the type of trading account you want to set up</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {accountTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Card
                      key={type.id}
                      className="relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
                      onClick={() => handleAccountTypeSelect(type.id)}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-full bg-purple-100">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold">{type.title}</h3>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                        <img
                          src={type.image}
                          alt={type.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <ChevronRight className="absolute right-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default UserOnboarding;