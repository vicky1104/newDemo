import React from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import {Viewport} from '@skele/components';
import {data} from './data';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Audio, Video} from 'expo-av';

console.warn('first');
function usePlayPauseAudio() {
  const [icons, setIcons] = React.useState('play');
  const [player] = React.useState(new Audio.Sound());

  const stopPlayer = React.useCallback(async () => {
    setIcons('play');
    await player.unloadAsync();
  }, [player]);

  const loadSound = React.useCallback(
    async voiceIntroSrc => {
      console.log('loading sound');
      const audio = voiceIntroSrc
        ? cloudinaryFeedUrl(voiceIntroSrc, 'audio')
        : null;

      console.log('voiceintro', voiceIntroSrc, 'audio', audio);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });

      player
        .loadAsync(
          {
            uri: audio,
          },
          Platform.OS === 'ios' ? true : false,
        )
        .then(async res => {
          if (res.isLoaded) {
            await playSoundFunc();
          }
        })
        .catch(err => {
          console.warn(err);
        });
    },
    [player],
  );

  const playSoundFunc = React.useCallback(async () => {
    setIcons('pause');
    const result = await player.getStatusAsync();
    console.log('PLaying sound---------');
    if (result.isLoaded) {
      if (result.isPlaying === false) {
        player.playAsync().then(res => {
          setTimeout(async () => {
            await stopPlayer();
          }, res.durationMillis);
        });
      } else {
        await stopPlayer();
      }
    }
  }, [player, stopPlayer]);

  const playAudio = React.useCallback(
    async voiceIntroSrc => {
      const result = await player.getStatusAsync();
      if (!result.isLoaded) {
        await loadSound(voiceIntroSrc);
      } else {
        await playSoundFunc();
      }
    },
    [loadSound, playSoundFunc],
  );

  // React.useEffect(async () => {
  //   return async () => {
  //     await stopPlayer();
  //     setIcons('play');
  //   };
  // }, [stopPlayer]);

  return {playAudio, stopPlayer, icons};
}

const cloudinaryFeedUrl = (src, type) => {
  if (src && type) {
    switch (type) {
      case 'image':
        return `https://res.cloudinary.com/banjee/image/upload/ar_1:1,c_pad,f_auto,q_auto:best/v1/${src}.webp`;
      case 'video':
        return `https://res.cloudinary.com/banjee/video/upload/br_128,q_auto/v1/${src}.mp4`;
      case 'audio':
        return `https://res.cloudinary.com/banjee/video/upload/br_128,q_auto/v1/${src}.mp3`;
      default:
        return `https://res.cloudinary.com/banjee/image/upload/ar_1:1,c_pad,f_auto,q_auto:best/v1/${src}.webp`;
    }
  }
};

const MainComp = ({ele}) => {
  const {icons, playAudio, stopPlayer} = usePlayPauseAudio();

  const renderComp = ele => {
    console.log(ele);
    if (ele) {
      const {mimeType, src} = ele;
      switch (mimeType) {
        case 'video/mp4':
          return (
            <Video
              shouldPlay={true}
              source={{uri: cloudinaryFeedUrl(src, 'video')}}
              resizeMode="contain"
              useNativeControls={true}
              style={{
                width: '100%',
                aspectRatio: 1,
              }}
            />
          );

        case 'audio/mp3':
          return (
            <View
              style={{
                height: 364,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'relative',
                  height: 60,
                }}>
                <Image
                  style={{width: '100%', borderRadius: 4, height: '100%'}}
                  source={require('./asset/feedAudioBg.png')}
                />
                <View
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'row',
                    height: 60,
                    width: '100%',
                    padding: 8,
                  }}>
                  <TouchableOpacity
                    onPress={() => playAudio(src, 'feed_audio')}>
                    <View
                      style={{
                        marginRight: 10,
                        width: 44,
                        height: 44,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#FFF',
                        borderRadius: 50,
                      }}>
                      <MaterialCommunityIcons name={icons} size={30} />
                    </View>
                  </TouchableOpacity>
                  {icons === 'pause' && (
                    <Image
                      style={{
                        height: '80%',
                        width: '100%',
                        alignSelf: 'center',
                      }}
                      source={require('./asset/wave.gif')}
                    />
                  )}
                </View>
              </View>
            </View>
          );
        default:
          return <Image source={{uri: cloudinaryFeedUrl(ele, 'feed_image')}} />;
      }
    } else return null;
  };

  return <View>{renderComp(ele)}</View>;
};
const Placeholder = () => <View style={styles.image} />;
const ViewportAwareImage = Viewport.Aware(
  Viewport.WithPlaceholder(MainComp, Placeholder),
);
const PRE_TRIGGER_RATIO = -0.4;

export default function App() {
  return (
    <Viewport.Tracker>
      <ScrollView
        scrollEventThrottle={16}
        contentContainerStyle={styles.container}>
        {data.map((ele, index) => (
          <ViewportAwareImage
            key={index}
            preTriggerRatio={PRE_TRIGGER_RATIO} // default is 0
            retainOnceInViewport={false} // default is false
            style={styles.image}
            ele={ele.mediaContent[0]}
          />
        ))}
      </ScrollView>
    </Viewport.Tracker>
  );
}

const styles = StyleSheet.create({
  container: {paddingHorizontal: 10, paddingVertical: 20},
  image: {height: 275, margin: 10, backgroundColor: 'darkgray'},
});
