import { MaterialIcons } from '@expo/vector-icons';
import { Text, View, ScrollView } from 'react-native';

export default function ProfileScreen() {
  const items =['Account Settings', 'Privacy Policy', 'Terms of Service', 'Help & Support', 'Logout'];
  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold">Profile</Text>
      <View className="mt-4 flex-row p-6 bg-white rounded-2xl shadow-black">
        <View className="w-20 h-20 rounded-full bg-gray-300 mr-4">

        </View>
        <View className="flex-col justify-center">
          <Text className="text-lg font-bold">Harshit Pathak</Text>
          <Text className="text-gray-500">admin@gmail.com</Text>
        </View>
      </View>


      {/* adding other items as well */}
      {items.map((item,index)=>{
        return(
           <View key={index} className="flex-row items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-black">
        <View className="flex-row items-center gap-4">
          <View className="w-10 h-10 rounded-full bg-gray-300">

          </View>
        <View>
          <Text className="font-semibold">{item}</Text>
        </View>
        </View>
        <View>

          <MaterialIcons
            name='arrow-right'
            size={24}
            color={'#4F6BED'}
          />

        </View>
      </View>
        )
      })}
     

    </View>
  );
}
