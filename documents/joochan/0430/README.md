# 3주차

## 25.04.30



## 안면인식

### 1. 2D -> 3D GPU 서버 세팅

서버 본체 : 모니터 죽은 삼성 오딧세이 노트북 (인텔 7세대 i5 + 엔비디아 GTX1060)

모니터가 죽어서 UEFI 접속이 안되기 때문에, 다른 기기에 SSD 장착하여 설치 후 이식해야 사용 가능.

외장 그래픽이 달린 노트북에서 외부 모니터 출력은 GPU에 접근이 되어야 하는데, 이식하기 위해서는 드라이버 설치를 못하므로 외부모니터 설정은 못함.

#### 1. Ubuntu Server auto install 만들어서 본체에 자동 설치 시도 - Ubuntu/WSL

1. 우분투 서버 이미지 [다운로드](https://releases.ubuntu.com/22.04/ubuntu-22.04.5-live-server-amd64.iso)

   ```bash
   wget https://releases.ubuntu.com/22.04/ubuntu-22.04.5-live-server-amd64.iso
   ```

   

2. 이미지  언팩
   ```bash
   # ISO 편집 툴 설치
   sudo apt-get update
   sudo apt-get install xorriso cloud-image-utils
   
   mkdir ~/ubuntu-autoinstall
   cd ~/ubuntu-autoinstall
   
   # ISO 파일 복사
   cp /path/to/ubuntu-22.04.5-live-server-amd64.iso .
   
   # ISO 파일 마운트
   mkdir mnt
   sudo mount -o loop ubuntu-22.04.5-live-server-amd64.iso mnt
   
   # 내용 복사
   mkdir extract
   rsync -a mnt/ extract/
   sudo umount mnt
   
   ```

   

3. 자동설치 설정
   ```bash
   mkdir -p extract/nocloud
   cd extract/nocloud
   touch user-data
   touch meta-data  # 비워 놓기
   sudo nano user-data
   
   cd ../..
   ```

   ```bash
   # user-data
   #cloud-config
   autoinstall:
     version: 1
     locale: ko_KR
     keyboard:
       layout: kr
     timezone: Asia/Seoul
     storage:
       layout:
         name: lvm
     identity:
       hostname: 서버 이름
       username: 유저 이름
       # 비밀번호 없이 SSH 키로만 접속
       password: "*"
       ssh:
         install-server: true
         authorized-keys:
           - ssh-rsa 생성한 ssh 키
     packages:
       - openssh-server
       - net-tools
       - htop
       - curl
       - wget
     late-commands:
       - curtin in-target -- apt-get update
       - curtin in-target -- apt-get install -y ubuntu-drivers-common  # 그래픽 드라이버 관리
       - curtin in-target -- ubuntu-drivers autoinstall  # 자동으로 적절한 드라이버 설치
       - curtin in-target -- reboot
   ```

4. 부팅 옵션 수정
   ```bash
   sudo nano extract/boot/grub/grub.cfg
   
   autoinstall ds=nocloud\;seedfrom=/cdrom/nocloud/
   # linux로 시작하는 줄에 추가해주기
   ```

   ```bash
   # 예시
   linux   /casper/vmlinuz --- quiet splash
   #여기에추가하여 아래처럼 만들기
   linux   /casper/vmlinuz autoinstall ds=nocloud\;seedfrom=/cdrom/nocloud/ --- quiet splash
   ```

5. 이미지로 패키징

   ```bash
   cd extract
   
   sudo xorriso -as mkisofs \
     -r -V "Ubuntu Autoinstall" \
     -J -l \
     -iso-level 3 \
     -o ../ubuntu-22.04.5-autoinstall.iso \
     -b EFI/boot/bootx64.efi \
     -c boot.catalog \
     -no-emul-boot -boot-load-size 4 -boot-info-table \
     -eltorito-alt-boot \
     -e EFI/boot/grubx64.efi \
     -no-emul-boot \
     .
   ```

   

6. USB에 이미지 쓰기 - [rufus](https://github.com/pbatard/rufus/releases/download/v4.7/rufus-4.7.exe)
   만들어진 이미지 파일 가져와서 쓰기

   - WSL에서 USB 접근 불가이므로 Window 환경으로 넘어와야 함.

   - Ubuntu에서는 USB 마운트 후 이미지 굽기
     ```bash
     sudo dd if=../ubuntu-22.04.5-autoinstall.iso of=<마운트위치> bs=4M status=progress && sync
     ```

     

7. USB 연결해서 자동 설치 시도

   - 실패
   - usb로 부팅하게 해야 하는데, 안 잡히는 거 같음

#### 2. Ubuntu Server 직접 설치 시도

1. 우분투 서버 이미지 [다운로드](https://releases.ubuntu.com/22.04/ubuntu-22.04.5-live-server-amd64.iso)

2. rufus [설치](https://github.com/pbatard/rufus/releases/download/v4.7/rufus-4.7.exe)

3. USB에 이미지 쓰기
   GRT 파티션으로 설치

4. 우분투 서버 설치
   다른 기기에 SSD 장착 후 해당 SSD에 설치 - OpenSSH 도 추가 설치

   키보드 레이아웃, 무선랜, 유선랜 잡아주기

   유저 등록

5. 자동로그인 설정
   ```bash
   sudo nano /etc/systemd/system/getty@tty1.service.d/override.conf
   ```

   ```bash
   # service.d/override.conf에 작성
   [Service]
   ExecStart=
   ExecStart=-/sbin/agetty --autologin <사용자이름> --noclear %I $TERM
   ```

   ```bash
   # 적용 후 재시작
   sudo systemctl daemon-reload
   sudo systemctl restart getty@tty1
   
   sudo reboot
   ```

   

6. SSH 키 등록 및 사용 설정

   SSH 키 생성

   ```bash
   ssh-keygen -t rsa -b 4096 -C "유저명@서버명"
   ```

   키 등록 및 설정

   ```bash
   cat ~/.ssh/id_rsa.pub
   
   # 나온 키 복사하고 서버에 SSH로 접속
   ssh 유저@서버주소
   
   # 등록할 서버에
   sudo nano ~/.ssh/authorized_keys
   # 복사한 키 붙여넣기
   
   # 유저 비밀번호 삭제
   sudo passwd -d <유저>
   
   # 루트 로그인 막기
   sudo nano /etc/ssh/sshd_config
   ```
   
   ```bash
   PermitRootLogin no
   ```
   
   

#### 3. Ubuntu Desktop으로 설치 후 CLI로 변경

1. 우분투 데스크탑 이미지 [다운로드](https://releases.ubuntu.com/22.04/ubuntu-22.04.5-desktop-amd64.iso)

2. Rufus로 이미지 USB만든 후 원하는 SSD에 설치

   - 영어, 한글레이아웃, 서울

   - 와이파이 잡아주기
   - minimal 버전으로 설치하고, 서드파티 패키지 설치 X

3. SSH 세팅 후 SSD 이식
   ```bash
   sudo apt-get update
   sudo apt-get install OpenSSH
   
   # 키 발급해서 등록
   sudo nano ~/.ssh/authorized_keys
   ```

   2번에서 한 설정 똑같이. 자동로그인 등...

4. SSH 접속 확인 후에 CLI 버전으로 변경
   ```bash
   # cli 환경에서 많이 쓰는 패키지 설치
   sudo apt install git build-essential dkms net-tools htop curl wget tmux bmon vim nano -y
   # CLI 변경
   sudo systemctl set-default multi-user.target
   sudo reboot
   
   # gui 관련 패키지 삭제 - cli로만 사용예정이라 삭제.
   # 만약 gui, cli 왔다갔다 할려면 그대로 유지
   sudo apt remove --purge ubuntu-desktop gdm3 gnome-shell gnome-session gnome-terminal -y
   sudo apt autoremove --purge -y
   sudo reboot
   ```

5. 그래픽 드라이버 설치

   ```bash
   sudo apt-get install -y ubuntu-drivers-common
   sudo ubuntu-drivers autoinstall
   ```

6. Zulu17, nginx 등 설치 후 ufw 잡기

