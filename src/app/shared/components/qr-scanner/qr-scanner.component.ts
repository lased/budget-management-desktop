import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Observable, from, fromEvent, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import jsQR, { QRCode } from 'jsqr';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html'
})
export class QrScannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() canvasWidth = 640;
  @Input() canvasHeight = 480;
  @Input() updateTime = 500;

  @Output() data = new EventEmitter<any>();
  @Output() failed = new EventEmitter<any>();

  @ViewChild('qrCanvas', { static: false }) qrCanvasRef: ElementRef<HTMLCanvasElement>;
  @ViewChild('video', { static: false }) videoRef: ElementRef;

  public foundCameras$: Observable<MediaDeviceInfo[]>;
  public context: CanvasRenderingContext2D;
  public videoElement: HTMLVideoElement;
  public chooseCamera: MediaDeviceInfo;
  public chooseCameraControl: string;
  public stream: MediaStream;
  private captureTimeout: any;
  private deviceChangeSubscription: Subscription;

  constructor(
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.chooseCameraControl = this.chooseCamera ? this.chooseCamera.deviceId : '';
  }

  ngOnDestroy() {
    this.stopScanning();
    this.deviceChangeSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.context = this.qrCanvasRef.nativeElement.getContext('2d');
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.foundCameras$ = this.getCameras();
    this.deviceChangeSubscription = fromEvent(navigator.mediaDevices, 'devicechange').pipe(
      map(event => {
        this.foundCameras$ = this.getCameras().pipe(
          map((cams: MediaDeviceInfo[]) => {
            const exists = cams.some((cam: MediaDeviceInfo) => cam.deviceId === (this.chooseCamera ? this.chooseCamera.deviceId : ''));

            if (!exists && this.videoElement) {
              this.stopScanning();
              this.renderer.removeChild(this.videoRef.nativeElement, this.videoElement);
              this.videoElement = null;
            }

            return cams;
          })
        );
      })
    ).subscribe();
  }

  getCameras(): Observable<MediaDeviceInfo[]> {
    return from(
      navigator
        .mediaDevices
        .enumerateDevices()
        .then((devices: MediaDeviceInfo[]) => devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput'))
    );
  }

  stopScanning() {
    if (this.captureTimeout) {
      clearTimeout(this.captureTimeout);
    }

    if (this.stream && this.stream.getTracks().length) {
      this.stream.getTracks().forEach(track => track.enabled && track.stop());
      this.stream = null;
    }
  }

  useCamera(camera: MediaDeviceInfo) {
    let constraints: MediaStreamConstraints;

    if (this.captureTimeout) {
      this.stopScanning();
    }

    this.chooseCamera = camera;
    constraints = { audio: false, video: { deviceId: camera.deviceId } };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream: MediaStream) => this.setStream(stream))
      .catch(err => {
        this.chooseCameraControl = '';
        this.failed.emit(err);
      });
  }

  private captureToCanvas() {
    let imgData: ImageData;
    let result: QRCode;

    this.context.drawImage(this.videoElement, 0, 0, this.canvasWidth, this.canvasHeight);
    imgData = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
    result = jsQR(imgData.data, imgData.width, imgData.height);

    if (!result) {
      this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
    } else {
      this.stopScanning();
      this.data.emit(result.data);
    }
  }

  private setStream(stream: MediaStream) {
    if (!this.videoElement) {
      this.videoElement = this.renderer.createElement('video');
      this.videoElement.setAttribute('autoplay', 'true');
      this.videoElement.setAttribute('muted', 'true');
      this.renderer.appendChild(this.videoRef.nativeElement, this.videoElement);
    }

    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.videoElement.srcObject = this.stream = stream;
    this.captureTimeout = setTimeout(() => this.captureToCanvas(), this.updateTime);
  }

}