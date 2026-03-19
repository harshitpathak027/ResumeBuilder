import { StyleSheet, View } from 'react-native';
import Dashboard from '../../components/screen/Dashboard';
import { Text } from 'react-native';
import DashboardProfile from '../../components/screen/DashboardProfile';
import MyResume from '../../components/screen/MyResume';
import MyResumeList from '../../components/screen/MyResumeList';
export default function HomeScreen() {

  return (
    <>
      <View className="flex-1 p-6 mt-8">
        <DashboardProfile />
        <View className='mb-4'>

          <Dashboard />
        </View>
<View className='mb-4'>

        <MyResume />
</View>
      <MyResumeList />
      </View>
    </>
  )
}


