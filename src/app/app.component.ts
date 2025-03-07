import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'radar';
  form: FormGroup = new FormGroup({
    segmentNumber: new FormControl(5, [Validators.min(1), Validators.max(25)])
  });

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  constructor(
      @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.init();
      this.updateScene(this.form.value.segmentNumber);
    }
  }

  onSegmentNumberChange(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.form.invalid) {
        return;
      }
      this.updateScene(this.form.value.segmentNumber);
    }
  }

  init(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x999999);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0.5, 1.0, 0.5).normalize();
    this.scene.add(light);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.y = 5;
    this.camera.position.z = 10;
    this.scene.add(this.camera);

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
    this.scene.add(grid);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', this.render.bind(this));
    this.controls.update();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  updateScene(segmentNumber: number): void {
    if (this.scene.children.length > 0) {
        this.scene.clear();
    }

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0.5, 1.0, 0.5).normalize();
    this.scene.add(light);

    const grid = new THREE.GridHelper(50, 50, 0xffffff, 0x7b7b7b);
    this.scene.add(grid);

    const cylinderPie = [];
    const indexArr = Array(segmentNumber);

    for (let i = 0; i < indexArr.length; i++) {
      indexArr[i] = i;
      const radiusSlice = 1;
      const extrudeSettingsSlice = {
        steps: 55,
        depth: 1 * i,
        bevelEnabled: false,
      };

      const generateSequentialColor = (i: number) => {
        const hue = (i * 137.508) % 360;
        return new THREE.Color(`hsl(${hue}, 100%, 50%)`).getHex();
      }

      const materialSlice = new THREE.MeshLambertMaterial({ color: generateSequentialColor(i) });
      const shapeSlice = new THREE.Shape();
      shapeSlice.moveTo(radiusSlice, 0);
      shapeSlice.arc(0, 0, radiusSlice, i * (Math.PI * 2) / indexArr.length, (i + 1) * (Math.PI * 2) / indexArr.length, false);
      shapeSlice.lineTo(radiusSlice, 0);
      const geometrySlice = new THREE.ExtrudeGeometry(shapeSlice, extrudeSettingsSlice);
      geometrySlice.rotateX(Math.PI * 0.5);
      const meshSlice = new THREE.Mesh(geometrySlice, materialSlice);
      meshSlice.position.y = extrudeSettingsSlice.depth;

      cylinderPie.push(meshSlice);
      const group = new THREE.Group();
      group.add(meshSlice);
      group.position.x = -1;
      this.scene.add(group);
    }

    this.render();
  }

  onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
