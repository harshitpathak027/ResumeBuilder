import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { ScrollView, Text, TouchableOpacity, View, Image } from 'react-native';
import MyResumeList from '../../components/screen/MyResumeList';
import { getAuthUser } from '../../utils/authStorage';
import { useEffect, useState } from 'react';

const T = {
  blue: '#3B82F6',
  green: '#58CC02',
  greenPressed: '#46A302',
  orange: '#F5A623',
  ink: '#141821',
  fieldBg: '#F8F9FA',
  fieldBorder: '#EAEBED',
  caps: '#9AA0AC',
};

export default function HomeScreen() {
  const [resumeItem, setResumeItem] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getAuthUser().then(setUser).catch(() => setUser(null));
  }, []);

  const initials = (user?.name || 'U').trim().charAt(0).toUpperCase();
  const streakCount = resumeItem.length || 3;
  const inProgress = resumeItem.find((r) => typeof r?.progress === 'number' && r.progress < 100);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 120 }}
      >
        {/* Header: My Resumes title, streak pill + avatar ring */}
        <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: T.ink, letterSpacing: -0.5 }}>My Resumes</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#FFF0D9' }}>
              <MaterialIcons name="local-fire-department" size={18} color={T.orange} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: T.orange }}>{streakCount}</Text>
            </View>

            {/* Avatar Photo with Gradient Ring */}
            <View style={{ width: 44, height: 44, borderRadius: 22, padding: 2.5, backgroundColor: T.green }}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
              ) : (
                <View style={{ width: '100%', height: '100%', borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: T.ink }}>{initials}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Primary 3D Duolingo CTA Button */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => router.push('/Template')}
          style={{ marginBottom: 28 }}
        >
          <View style={{ borderRadius: 24, paddingBottom: 5, backgroundColor: T.greenPressed }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 24, paddingVertical: 18, backgroundColor: T.green }}>
              <MaterialIcons name="add" size={24} color="#FFFFFF" style={{ fontWeight: '800' }} />
              <Text style={{ marginLeft: 6, fontSize: 15, fontWeight: '800', letterSpacing: 0.8, color: '#FFFFFF' }}>
                CREATE NEW RESUME
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* List component */}
        <MyResumeList setResumeItem={setResumeItem} />

        {/* Mascot XP / Rank Nudge Card */}
        {inProgress && (
          <View style={{
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: T.fieldBorder,
            backgroundColor: '#FFFFFF',
            padding: 18,
            shadowColor: '#000000',
            shadowOpacity: 0.04,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}>
            <View style={{ width: 64, height: 64, borderRadius: 18, overflow: 'hidden', backgroundColor: '#D7F173' }}>
              <LottieView source={require('../../assets/images/lionblink.json')} autoPlay loop style={{ width: '100%', height: '100%' }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13.5, lineHeight: 20, fontWeight: '600', color: T.ink }}>
                You're close to a Master Rank! Finish your <Text style={{ fontWeight: '800' }}>{inProgress.title}</Text> resume to earn +200 XP.
              </Text>
              <TouchableOpacity style={{ marginTop: 6 }} activeOpacity={0.7} onPress={() => router.push('/Template')}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: T.blue, textDecorationLine: 'underline', letterSpacing: 0.5 }}>
                  KEEP GOING
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}