import { Muxer, ArrayBufferTarget } from '../../node_modules/mp4-muxer/build/mp4-muxer.mjs';

let muxer = null;
let videoEncoder = null;
let audioEncoder = null;

self.onmessage = async (e) => {
    const { type, data } = e.data;
    
    if (type === 'START') {
        muxer = new Muxer({
            target: new ArrayBufferTarget(),
            video: { codec: 'avc', width: 720, height: 1280 },
            audio: { codec: 'aac', numberOfChannels: 2, sampleRate: data.sampleRate },
            fastStart: 'in-memory',
            firstTimestampBehavior: 'offset'
        });

        videoEncoder = new VideoEncoder({
            output: (chunk, metadata) => muxer && muxer.addVideoChunk(chunk, metadata),
            error: (err) => console.error('[WorkerVideo] Error:', err)
        });
        videoEncoder.configure({
            codec: 'avc1.42E028',
            width: 720, height: 1280,
            bitrate: 3000000,
            framerate: 30
        });

        audioEncoder = new AudioEncoder({
            output: (chunk, metadata) => muxer && muxer.addAudioChunk(chunk, metadata),
            error: (err) => console.error('[WorkerAudio] Error:', err)
        });
        audioEncoder.configure({
            codec: 'mp4a.40.2',
            numberOfChannels: 2,
            sampleRate: data.sampleRate,
            bitrate: 128000
        });
    }

    if (type === 'VIDEO_FRAME') {
        if (videoEncoder && videoEncoder.state === 'configured') {
            videoEncoder.encode(data.frame, { keyFrame: data.keyFrame });
        }
        data.frame.close();
    }

    if (type === 'AUDIO_DATA') {
        if (audioEncoder && audioEncoder.state === 'configured') {
            audioEncoder.encode(data.audioData);
        }
        data.audioData.close();
    }

    if (type === 'STOP') {
        if (videoEncoder) { await videoEncoder.flush(); videoEncoder.close(); }
        if (audioEncoder) { await audioEncoder.flush(); audioEncoder.close(); }
        if (muxer) {
            muxer.finalize();
            const { buffer } = muxer.target;
            self.postMessage({ type: 'DONE', buffer }, [buffer]);
            muxer = null;
        }
    }
};
