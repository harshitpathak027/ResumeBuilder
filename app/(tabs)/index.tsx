import { View } from 'react-native';
import Dashboard from '../../components/screen/Dashboard';
import DashboardProfile from '../../components/screen/DashboardProfile';
import MyResume from '../../components/screen/MyResume';
import MyResumeList from '../../components/screen/MyResumeList';
import { useState } from 'react';
export default function HomeScreen() {
const [resumeItem,setResumeItem] = useState([]);
  return (
    <>
      <View className="flex-1 p-6 mt-8">
        <DashboardProfile />
        <View className='mb-4'>

          <Dashboard resumeItem={resumeItem} />
        </View>
<View className='mb-4'>

        <MyResume />
</View>
      <MyResumeList setResumeItem={setResumeItem} />
      </View>
    </>
  )
}


